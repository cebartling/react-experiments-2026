import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePrefetchStocks } from '../usePrefetchStocks';
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
];

const mockStock: Stock = mockStocks[0];

vi.mock('../../api/stockApi', () => ({
  fetchStocks: vi.fn(),
  fetchStockBySymbol: vi.fn(),
}));

import { fetchStocks, fetchStockBySymbol } from '../../api/stockApi';

const mockedFetchStocks = vi.mocked(fetchStocks);
const mockedFetchStockBySymbol = vi.mocked(fetchStockBySymbol);

describe('usePrefetchStocks', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetAllMocks();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should return prefetch functions', () => {
    const { result } = renderHook(() => usePrefetchStocks(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.prefetchStocks).toBe('function');
    expect(typeof result.current.prefetchStock).toBe('function');
  });

  it('should prefetch all stocks', async () => {
    mockedFetchStocks.mockResolvedValue(mockStocks);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => usePrefetchStocks(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.prefetchStocks();
    });

    expect(mockedFetchStocks).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryData(queryKeys.stocks.all)).toEqual(mockStocks);
  });

  it('should prefetch single stock', async () => {
    mockedFetchStockBySymbol.mockResolvedValue(mockStock);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => usePrefetchStocks(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.prefetchStock('AAPL');
    });

    expect(mockedFetchStockBySymbol).toHaveBeenCalledWith('AAPL');
    expect(queryClient.getQueryData(queryKeys.stocks.detail('AAPL'))).toEqual(mockStock);
  });

  it('should not refetch if data is fresh', async () => {
    mockedFetchStocks.mockResolvedValue(mockStocks);
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(queryKeys.stocks.all, mockStocks);

    const { result } = renderHook(() => usePrefetchStocks(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.prefetchStocks();
    });

    expect(mockedFetchStocks).not.toHaveBeenCalled();
  });
});
