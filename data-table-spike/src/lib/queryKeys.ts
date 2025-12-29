/**
 * Query key factory for type-safe and consistent query keys
 *
 * Usage:
 *   queryKeys.stocks.all        -> ['stocks']
 *   queryKeys.stocks.list()     -> ['stocks', 'list']
 *   queryKeys.stocks.detail(id) -> ['stocks', 'detail', id]
 */
export const queryKeys = {
  stocks: {
    all: ['stocks'] as const,
    lists: () => [...queryKeys.stocks.all, 'list'] as const,
    list: (filters?: { search?: string; sort?: string }) =>
      [...queryKeys.stocks.lists(), filters] as const,
    details: () => [...queryKeys.stocks.all, 'detail'] as const,
    detail: (symbol: string) => [...queryKeys.stocks.details(), symbol] as const,
  },
} as const;

/**
 * Type helper for query keys
 */
export type QueryKeys = typeof queryKeys;
