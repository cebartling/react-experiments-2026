import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useStockData } from '../useStockData';
import { createWrapper } from '../../test/queryTestUtils';
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

vi.mock('../../api/stockApi', () => ({
  fetchStocks: vi.fn(),
}));

import { fetchStocks } from '../../api/stockApi';

const mockedFetchStocks = vi.mocked(fetchStocks);

describe('useStockData', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetAllMocks();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should return loading state initially', () => {
    mockedFetchStocks.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useStockData(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should return data when fetch succeeds', async () => {
    mockedFetchStocks.mockResolvedValue(mockStocks);

    const { result } = renderHook(() => useStockData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockStocks);
    expect(result.current.error).toBeNull();
  });

  it('should return error when fetch fails', async () => {
    const error = new Error('Network error');
    mockedFetchStocks.mockRejectedValue(error);

    const { result } = renderHook(() => useStockData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(error);
    expect(result.current.data).toBeUndefined();
  });

  it('should call fetchStocks', async () => {
    mockedFetchStocks.mockResolvedValue(mockStocks);

    renderHook(() => useStockData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockedFetchStocks).toHaveBeenCalledTimes(1);
    });
  });

  it('should not fetch when enabled is false', async () => {
    mockedFetchStocks.mockResolvedValue(mockStocks);

    const { result } = renderHook(() => useStockData({ enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedFetchStocks).not.toHaveBeenCalled();
  });

  it('should accept refetchInterval option', async () => {
    mockedFetchStocks.mockResolvedValue(mockStocks);

    const { result } = renderHook(() => useStockData({ refetchInterval: 5000 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockStocks);
  });

  it('should disable refetch when refetchInterval is 0', async () => {
    mockedFetchStocks.mockResolvedValue(mockStocks);

    const { result } = renderHook(() => useStockData({ refetchInterval: 0 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockStocks);
  });
});
