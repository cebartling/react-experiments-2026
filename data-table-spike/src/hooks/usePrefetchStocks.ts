import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchStocks, fetchStockBySymbol } from '../api/stockApi';
import { queryKeys } from '../lib/queryKeys';

/**
 * Hook for prefetching stock data
 *
 * @example
 * ```tsx
 * const { prefetchStocks, prefetchStock } = usePrefetchStocks();
 *
 * // Prefetch on hover
 * <button onMouseEnter={() => prefetchStock('AAPL')}>
 *   View Apple
 * </button>
 * ```
 */
export function usePrefetchStocks() {
  const queryClient = useQueryClient();

  const prefetchStocks = useCallback(async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.stocks.all,
      queryFn: fetchStocks,
      staleTime: 30 * 1000,
    });
  }, [queryClient]);

  const prefetchStock = useCallback(
    async (symbol: string) => {
      await queryClient.prefetchQuery({
        queryKey: queryKeys.stocks.detail(symbol),
        queryFn: () => fetchStockBySymbol(symbol),
        staleTime: 30 * 1000,
      });
    },
    [queryClient]
  );

  return { prefetchStocks, prefetchStock };
}
