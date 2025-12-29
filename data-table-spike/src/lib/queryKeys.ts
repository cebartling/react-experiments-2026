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
    listBase: () => [...queryKeys.stocks.all, 'list'] as const,
    list: (filters?: { search?: string; sort?: string }) =>
      [...queryKeys.stocks.listBase(), filters] as const,
    detailBase: () => [...queryKeys.stocks.all, 'detail'] as const,
    detail: (symbol: string) => [...queryKeys.stocks.detailBase(), symbol] as const,
  },
} as const;

/**
 * Type helper for query keys
 */
export type QueryKeys = typeof queryKeys;
