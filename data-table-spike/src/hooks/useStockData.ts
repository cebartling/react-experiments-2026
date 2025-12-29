import { useQuery } from '@tanstack/react-query';
import { fetchStocks } from '../api';
import type { Stock } from '../types/stock';

export const STOCK_QUERY_KEY = ['stocks'] as const;

export interface UseStockDataResult {
  data: Stock[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

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
