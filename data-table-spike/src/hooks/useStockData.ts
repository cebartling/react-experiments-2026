import { useQuery } from '@tanstack/react-query';
import { fetchStocks } from '../api';
import type { Stock } from '../types/stock';

/** Query key for stock data caching with TanStack Query */
export const STOCK_QUERY_KEY = ['stocks'] as const;

/**
 * Return type for the useStockData hook.
 */
export interface UseStockDataResult {
  /** Array of stock data, undefined while loading or on error */
  data: Stock[] | undefined;
  /** True during initial data fetch */
  isLoading: boolean;
  /** True if the query encountered an error */
  isError: boolean;
  /** Error object if query failed, null otherwise */
  error: Error | null;
  /** Function to manually trigger a data refetch */
  refetch: () => void;
}

/**
 * Custom hook for fetching and caching stock data using TanStack Query.
 *
 * Features:
 * - Automatic caching with 30-second stale time
 * - No refetch on window focus (to prevent unwanted updates)
 * - Manual refetch capability for retry functionality
 *
 * @returns Object containing stock data, loading/error states, and refetch function
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useStockData();
 * if (isLoading) return <LoadingState />;
 * if (error) return <ErrorState error={error} onRetry={refetch} />;
 * return <StockList stocks={data} />;
 * ```
 */
export function useStockData(): UseStockDataResult {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: STOCK_QUERY_KEY,
    queryFn: fetchStocks,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  return {
    data,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
