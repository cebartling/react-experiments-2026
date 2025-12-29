import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStockData, STOCK_QUERY_KEY } from '../useStockData';
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

vi.mock('../../api', () => ({
  fetchStocks: vi.fn(),
}));

import { fetchStocks } from '../../api';

const mockedFetchStocks = vi.mocked(fetchStocks);

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useStockData', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetAllMocks();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should have correct query key', () => {
    expect(STOCK_QUERY_KEY).toEqual(['stocks']);
  });

  it('should return loading state initially', () => {
    mockedFetchStocks.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useStockData(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
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

  it('should provide refetch function', async () => {
    mockedFetchStocks.mockResolvedValue(mockStocks);

    const { result } = renderHook(() => useStockData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
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
});
