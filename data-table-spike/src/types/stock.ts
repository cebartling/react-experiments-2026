/**
 * Represents a single stock's market data
 */
export interface Stock {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high52Week: number;
  low52Week: number;
  lastUpdated: string;
}

/**
 * API response wrapper for stock data
 */
export interface StockApiResponse {
  data: Stock[];
  meta: {
    timestamp: string;
    count: number;
  };
}

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  /** Page number (0-indexed) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Search query for filtering */
  search?: string;
  /** Field to sort by */
  sortBy?: keyof Stock;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated API response wrapper for stock data
 */
export interface PaginatedStockApiResponse {
  data: Stock[];
  meta: {
    timestamp: string;
    count: number;
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Error response from the API
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
