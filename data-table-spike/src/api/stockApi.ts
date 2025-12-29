import { API_CONFIG } from '../config/api';
import { StockApiError } from './errors';
import type { Stock, StockApiResponse } from '../types/stock';

let hasWarnedAboutMissingApiKey = false;

/**
 * Creates headers for API requests
 */
function createHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (API_CONFIG.apiKey) {
    headers['Authorization'] = `Bearer ${API_CONFIG.apiKey}`;
  } else if (!hasWarnedAboutMissingApiKey) {
    console.warn(
      '[StockAPI] API key is not configured. Set VITE_STOCK_API_KEY environment variable.'
    );
    hasWarnedAboutMissingApiKey = true;
  }

  return headers;
}

/**
 * Wrapper for fetch with timeout and error handling
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Handles API response and throws on errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      // Response body is not JSON
    }
    throw StockApiError.fromResponse(response, errorBody);
  }

  return response.json();
}

/**
 * Fetches all stocks from the API
 */
export async function fetchStocks(): Promise<Stock[]> {
  const url = `${API_CONFIG.baseUrl}/stocks`;

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: createHeaders(),
    });

    const data = await handleResponse<StockApiResponse>(response);
    return data.data;
  } catch (error) {
    if (error instanceof StockApiError) {
      console.error(`[StockAPI] Error fetching stocks: ${error.message}`, {
        statusCode: error.statusCode,
        code: error.code,
      });
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new StockApiError('Request timeout', 0, 'TIMEOUT');
    }

    throw new StockApiError(
      error instanceof Error ? error.message : 'Unknown error',
      0,
      'NETWORK_ERROR'
    );
  }
}

/**
 * Fetches a single stock by symbol
 */
export async function fetchStockBySymbol(symbol: string): Promise<Stock> {
  const url = `${API_CONFIG.baseUrl}/stocks/${encodeURIComponent(symbol)}`;

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: createHeaders(),
    });

    return await handleResponse<Stock>(response);
  } catch (error) {
    if (error instanceof StockApiError) {
      console.error(`[StockAPI] Error fetching stock ${symbol}: ${error.message}`);
      throw error;
    }

    throw new StockApiError(
      error instanceof Error ? error.message : 'Unknown error',
      0,
      'NETWORK_ERROR'
    );
  }
}
