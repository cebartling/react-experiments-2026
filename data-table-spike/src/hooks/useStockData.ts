import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { fetchStocks } from '../api/stockApi';
import { queryKeys } from '../lib/queryKeys';
import type { Stock } from '../types/stock';

/**
 * Configuration options for useStockData hook
 */
interface UseStockDataOptions {
  /** Whether to enable automatic refetching */
  enabled?: boolean;
  /** Refetch interval in milliseconds (0 to disable) */
  refetchInterval?: number;
  /** Additional query options */
  queryOptions?: Omit<UseQueryOptions<Stock[], Error>, 'queryKey' | 'queryFn'>;
}

/**
 * Hook for fetching and managing stock data
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useStockData();
 * ```
 *
 * @example With auto-refresh
 * ```tsx
 * const { data } = useStockData({ refetchInterval: 60000 });
 * ```
 */
export function useStockData(options: UseStockDataOptions = {}) {
  const {
    enabled = true,
    refetchInterval = 60 * 1000, // 1 minute default
    queryOptions,
  } = options;

  return useQuery({
    queryKey: queryKeys.stocks.all,
    queryFn: fetchStocks,
    enabled,
    refetchInterval: refetchInterval > 0 ? refetchInterval : false,
    ...queryOptions,
  });
}
