import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from '../lib/queryKeys';
import type { Stock } from '../types/stock';

/**
 * Hook for manipulating stock cache
 *
 * @example
 * ```tsx
 * const { invalidateStocks, updateStockInCache } = useStockCache();
 *
 * // Force refetch
 * await invalidateStocks();
 *
 * // Optimistic update
 * updateStockInCache('AAPL', { price: 155.00 });
 * ```
 */
export function useStockCache() {
  const queryClient = useQueryClient();

  /**
   * Invalidate all stock queries, triggering a refetch
   */
  const invalidateStocks = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.stocks.all,
    });
  }, [queryClient]);

  /**
   * Invalidate a single stock query
   */
  const invalidateStock = useCallback(
    async (symbol: string) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.stocks.detail(symbol),
      });
    },
    [queryClient]
  );

  /**
   * Update a stock in the cache (optimistic update)
   */
  const updateStockInCache = useCallback(
    (symbol: string, updates: Partial<Stock>) => {
      // Update in list cache
      queryClient.setQueryData<Stock[]>(queryKeys.stocks.all, (old) => {
        if (!old) return old;
        return old.map((stock) => (stock.symbol === symbol ? { ...stock, ...updates } : stock));
      });

      // Update in detail cache
      queryClient.setQueryData<Stock>(queryKeys.stocks.detail(symbol), (old) => {
        if (!old) return old;
        return { ...old, ...updates };
      });
    },
    [queryClient]
  );

  /**
   * Get stock data from cache without triggering a fetch
   */
  const getStockFromCache = useCallback(
    (symbol: string): Stock | undefined => {
      // Try detail cache first
      const detail = queryClient.getQueryData<Stock>(queryKeys.stocks.detail(symbol));
      if (detail) return detail;

      // Fall back to list cache
      const list = queryClient.getQueryData<Stock[]>(queryKeys.stocks.all);
      return list?.find((stock) => stock.symbol === symbol);
    },
    [queryClient]
  );

  return {
    invalidateStocks,
    invalidateStock,
    updateStockInCache,
    getStockFromCache,
  };
}
