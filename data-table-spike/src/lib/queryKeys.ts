import type { Stock } from '../types/stock';

/**
 * Parameters for filtering stock queries
 */
export interface StockQueryFilters {
  search?: string;
  sortBy?: keyof Stock;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Query key factory for type-safe and consistent query keys
 *
 * Usage:
 *   queryKeys.stocks.all                    -> ['stocks']
 *   queryKeys.stocks.list()                 -> ['stocks', 'list']
 *   queryKeys.stocks.list({ search: 'AAPL' }) -> ['stocks', 'list', { search: 'AAPL' }]
 *   queryKeys.stocks.infinite()             -> ['stocks', 'infinite']
 *   queryKeys.stocks.infinite({ search })   -> ['stocks', 'infinite', { search }]
 *   queryKeys.stocks.detail('AAPL')         -> ['stocks', 'detail', 'AAPL']
 */
export const queryKeys = {
  stocks: {
    all: ['stocks'] as const,
    listBase: () => [...queryKeys.stocks.all, 'list'] as const,
    list: (filters?: StockQueryFilters) => [...queryKeys.stocks.listBase(), filters] as const,
    infiniteBase: () => [...queryKeys.stocks.all, 'infinite'] as const,
    infinite: (filters?: StockQueryFilters) =>
      [...queryKeys.stocks.infiniteBase(), filters] as const,
    detailBase: () => [...queryKeys.stocks.all, 'detail'] as const,
    detail: (symbol: string) => [...queryKeys.stocks.detailBase(), symbol] as const,
  },
} as const;

/**
 * Type helper for query keys
 */
export type QueryKeys = typeof queryKeys;
