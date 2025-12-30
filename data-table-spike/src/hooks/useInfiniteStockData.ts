import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchStocksPaginated } from '../api/stockApi';
import { queryKeys, type StockQueryFilters } from '../lib/queryKeys';
import type { PaginatedStockApiResponse, Stock } from '../types/stock';

/**
 * Configuration options for useInfiniteStockData hook
 */
interface UseInfiniteStockDataOptions {
  /** Number of items per page. Defaults to 50. */
  pageSize?: number;
  /** Search query to filter stocks by symbol or company name */
  search?: string;
  /** Field to sort by */
  sortBy?: keyof Stock;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Whether to enable the query */
  enabled?: boolean;
}

/**
 * Hook for fetching paginated stock data with infinite scrolling support.
 *
 * Uses TanStack Query's useInfiniteQuery for efficient data loading and caching.
 * Automatically handles pagination, loading states, and error recovery.
 *
 * Features:
 * - Infinite scroll pagination
 * - Server-side search filtering
 * - Server-side sorting
 * - Automatic cache management
 * - Optimistic loading indicators
 *
 * @param options - Configuration options for the query
 * @returns Infinite query result with paginated stock data
 *
 * @example Basic usage
 * ```tsx
 * const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteStockData();
 *
 * // Flatten all pages into a single array
 * const allStocks = data?.pages.flatMap(page => page.data) ?? [];
 * ```
 *
 * @example With search and sorting
 * ```tsx
 * const { data } = useInfiniteStockData({
 *   search: 'tech',
 *   sortBy: 'marketCap',
 *   sortOrder: 'desc',
 *   pageSize: 100,
 * });
 * ```
 */
export function useInfiniteStockData(options: UseInfiniteStockDataOptions = {}) {
  const {
    pageSize = 50,
    search,
    sortBy,
    sortOrder,
    enabled = true,
  } = options;

  const filters: StockQueryFilters = {
    search,
    sortBy,
    sortOrder,
  };

  return useInfiniteQuery({
    queryKey: queryKeys.stocks.infinite(filters),
    queryFn: async ({ pageParam }) => {
      return fetchStocksPaginated({
        page: pageParam as number,
        pageSize,
        search,
        sortBy,
        sortOrder,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: PaginatedStockApiResponse) => {
      if (lastPage.meta.hasNextPage) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage: PaginatedStockApiResponse) => {
      if (firstPage.meta.hasPreviousPage) {
        return firstPage.meta.page - 1;
      }
      return undefined;
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Helper function to flatten paginated stock data into a single array.
 *
 * @param pages - Array of paginated response pages
 * @returns Flattened array of all stocks across pages
 */
export function flattenStockPages(
  pages: PaginatedStockApiResponse[] | undefined
): Stock[] {
  if (!pages) return [];
  return pages.flatMap((page) => page.data);
}

/**
 * Helper function to get total count from paginated response.
 *
 * @param pages - Array of paginated response pages
 * @returns Total count of stocks matching the query
 */
export function getTotalCount(
  pages: PaginatedStockApiResponse[] | undefined
): number {
  if (!pages || pages.length === 0) return 0;
  return pages[0].meta.totalCount;
}
