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
 * Error response from the API
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
