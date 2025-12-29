import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStockCache } from '../useStockCache';
import { createWrapper, createTestQueryClient } from '../../test/queryTestUtils';
import { queryKeys } from '../../lib/queryKeys';
import type { Stock } from '../../types/stock';

const mockStocks: Stock[] = [
  {
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    price: 150.0,
    change: 2.5,
    changePercent: 1.69,
    volume: 75000000,
    marketCap: 2400000000000,
    high52Week: 180.0,
    low52Week: 120.0,
    lastUpdated: '2024-01-15T16:00:00Z',
  },
  {
    symbol: 'GOOGL',
    companyName: 'Alphabet Inc.',
    price: 140.0,
    change: 1.5,
    changePercent: 1.08,
    volume: 20000000,
    marketCap: 1800000000000,
    high52Week: 155.0,
    low52Week: 100.0,
    lastUpdated: '2024-01-15T16:00:00Z',
  },
];

describe('useStockCache', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return cache manipulation functions', () => {
    const { result } = renderHook(() => useStockCache(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.invalidateStocks).toBe('function');
    expect(typeof result.current.invalidateStock).toBe('function');
    expect(typeof result.current.updateStockInCache).toBe('function');
    expect(typeof result.current.getStockFromCache).toBe('function');
  });

  it('should get stock from list cache', () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(queryKeys.stocks.all, mockStocks);

    const { result } = renderHook(() => useStockCache(), {
      wrapper: createWrapper(queryClient),
    });

    const stock = result.current.getStockFromCache('AAPL');
    expect(stock).toEqual(mockStocks[0]);
  });

  it('should get stock from detail cache', () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(queryKeys.stocks.detail('AAPL'), mockStocks[0]);

    const { result } = renderHook(() => useStockCache(), {
      wrapper: createWrapper(queryClient),
    });

    const stock = result.current.getStockFromCache('AAPL');
    expect(stock).toEqual(mockStocks[0]);
  });

  it('should return undefined for non-existent stock', () => {
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useStockCache(), {
      wrapper: createWrapper(queryClient),
    });

    const stock = result.current.getStockFromCache('INVALID');
    expect(stock).toBeUndefined();
  });

  it('should update stock in list cache', () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(queryKeys.stocks.all, mockStocks);

    const { result } = renderHook(() => useStockCache(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.updateStockInCache('AAPL', { price: 160.0 });
    });

    const updatedStocks = queryClient.getQueryData<Stock[]>(queryKeys.stocks.all);
    expect(updatedStocks?.[0].price).toBe(160.0);
    expect(updatedStocks?.[1].price).toBe(140.0); // Other stock unchanged
  });

  it('should update stock in detail cache', () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(queryKeys.stocks.detail('AAPL'), mockStocks[0]);

    const { result } = renderHook(() => useStockCache(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.updateStockInCache('AAPL', { price: 160.0 });
    });

    const updatedStock = queryClient.getQueryData<Stock>(queryKeys.stocks.detail('AAPL'));
    expect(updatedStock?.price).toBe(160.0);
  });

  it('should invalidate all stocks', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(queryKeys.stocks.all, mockStocks);

    const { result } = renderHook(() => useStockCache(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.invalidateStocks();
    });

    await waitFor(() => {
      const state = queryClient.getQueryState(queryKeys.stocks.all);
      expect(state?.isInvalidated).toBe(true);
    });
  });

  it('should invalidate single stock', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(queryKeys.stocks.detail('AAPL'), mockStocks[0]);

    const { result } = renderHook(() => useStockCache(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.invalidateStock('AAPL');
    });

    await waitFor(() => {
      const state = queryClient.getQueryState(queryKeys.stocks.detail('AAPL'));
      expect(state?.isInvalidated).toBe(true);
    });
  });
});
