import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { fetchStockBySymbol } from '../api/stockApi';
import { queryKeys } from '../lib/queryKeys';
import type { Stock } from '../types/stock';

/**
 * Configuration options for useStock hook
 */
interface UseStockOptions {
  /** Whether to enable the query */
  enabled?: boolean;
  /** Additional query options */
  queryOptions?: Omit<UseQueryOptions<Stock, Error>, 'queryKey' | 'queryFn' | 'enabled'>;
}

/**
 * Hook for fetching a single stock by symbol
 *
 * @example
 * ```tsx
 * const { data: stock } = useStock('AAPL');
 * ```
 */
export function useStock(symbol: string, options: UseStockOptions = {}) {
  const { enabled = true, queryOptions } = options;

  return useQuery({
    queryKey: queryKeys.stocks.detail(symbol),
    queryFn: () => fetchStockBySymbol(symbol),
    enabled: enabled && Boolean(symbol),
    ...queryOptions,
  });
}
