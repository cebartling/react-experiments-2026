import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchStocks, fetchStockBySymbol } from '../stockApi';
import { StockApiError } from '../errors';
import type { Stock, StockApiResponse } from '../../types/stock';

const mockStocks: Stock[] = [
  {
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    price: 150.0,
    change: 2.5,
    changePercent: 1.69,
    volume: 75000000,
    marketCap: 2400000000000,
    high52Week: 180.0,
    low52Week: 120.0,
    lastUpdated: '2024-01-15T16:00:00Z',
  },
  {
    symbol: 'GOOGL',
    companyName: 'Alphabet Inc.',
    price: 140.0,
    change: -1.2,
    changePercent: -0.85,
    volume: 25000000,
    marketCap: 1800000000000,
    high52Week: 155.0,
    low52Week: 100.0,
    lastUpdated: '2024-01-15T16:00:00Z',
  },
];

const mockApiResponse: StockApiResponse = {
  data: mockStocks,
  meta: {
    timestamp: '2024-01-15T16:00:00Z',
    count: 2,
  },
};

describe('stockApi', () => {
  const originalFetch = globalThis.fetch;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('fetchStocks', () => {
    it('should fetch stocks successfully', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      const result = await fetchStocks();

      expect(result).toEqual(mockStocks);
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/stocks'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should throw StockApiError on HTTP 401 error', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ code: 'AUTH_ERROR', message: 'Invalid API key' }),
      });

      await expect(fetchStocks()).rejects.toThrow(StockApiError);

      try {
        await fetchStocks();
      } catch (error) {
        expect(error).toBeInstanceOf(StockApiError);
        const apiError = error as StockApiError;
        expect(apiError.statusCode).toBe(401);
        expect(apiError.message).toBe('Invalid API key');
        expect(apiError.code).toBe('AUTH_ERROR');
      }
    });

    it('should throw StockApiError on HTTP 500 error', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ message: 'Server error' }),
      });

      await expect(fetchStocks()).rejects.toThrow(StockApiError);
    });

    it('should throw StockApiError on HTTP error with non-JSON body', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: () => Promise.reject(new Error('Not JSON')),
      });

      await expect(fetchStocks()).rejects.toThrow(StockApiError);

      try {
        await fetchStocks();
      } catch (error) {
        const apiError = error as StockApiError;
        expect(apiError.statusCode).toBe(503);
        expect(apiError.message).toBe('Service Unavailable');
      }
    });

    it('should throw StockApiError on network error', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(fetchStocks()).rejects.toThrow(StockApiError);

      try {
        await fetchStocks();
      } catch (error) {
        const apiError = error as StockApiError;
        expect(apiError.statusCode).toBe(0);
        expect(apiError.code).toBe('NETWORK_ERROR');
        expect(apiError.message).toBe('Network error');
      }
    });

    it('should throw StockApiError on timeout', async () => {
      const abortError = new DOMException('The operation was aborted.', 'AbortError');
      globalThis.fetch = vi.fn().mockRejectedValue(abortError);

      await expect(fetchStocks()).rejects.toThrow(StockApiError);

      try {
        await fetchStocks();
      } catch (error) {
        const apiError = error as StockApiError;
        expect(apiError.statusCode).toBe(0);
        expect(apiError.code).toBe('TIMEOUT');
        expect(apiError.message).toBe('Request timeout');
      }
    });

    it('should throw StockApiError on rate limit (429)', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: () => Promise.resolve({ code: 'RATE_LIMIT', message: 'Rate limit exceeded' }),
      });

      try {
        await fetchStocks();
      } catch (error) {
        const apiError = error as StockApiError;
        expect(apiError.statusCode).toBe(429);
        expect(apiError.isRateLimited).toBe(true);
      }
    });

    it('should log error details on failure', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ code: 'BAD_REQUEST', message: 'Invalid request' }),
      });

      try {
        await fetchStocks();
      } catch {
        // Error is expected
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[StockAPI] Error fetching stocks'),
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST',
        })
      );
    });
  });

  describe('fetchStockBySymbol', () => {
    const mockStock = mockStocks[0];

    it('should fetch a single stock by symbol', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStock),
      });

      const result = await fetchStockBySymbol('AAPL');

      expect(result).toEqual(mockStock);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/stocks/AAPL'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should URL encode the symbol', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStock),
      });

      await fetchStockBySymbol('BRK.A');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/stocks/BRK.A'),
        expect.any(Object)
      );
    });

    it('should throw StockApiError on 404', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ code: 'NOT_FOUND', message: 'Stock not found' }),
      });

      await expect(fetchStockBySymbol('INVALID')).rejects.toThrow(StockApiError);

      try {
        await fetchStockBySymbol('INVALID');
      } catch (error) {
        const apiError = error as StockApiError;
        expect(apiError.statusCode).toBe(404);
        expect(apiError.message).toBe('Stock not found');
      }
    });

    it('should throw StockApiError on network error', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

      await expect(fetchStockBySymbol('AAPL')).rejects.toThrow(StockApiError);

      try {
        await fetchStockBySymbol('AAPL');
      } catch (error) {
        const apiError = error as StockApiError;
        expect(apiError.statusCode).toBe(0);
        expect(apiError.code).toBe('NETWORK_ERROR');
      }
    });

    it('should log error details on failure', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ code: 'NOT_FOUND', message: 'Stock not found' }),
      });

      try {
        await fetchStockBySymbol('INVALID');
      } catch {
        // Error is expected
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[StockAPI] Error fetching stock INVALID'),
        expect.objectContaining({
          statusCode: 404,
          code: 'NOT_FOUND',
        })
      );
    });
  });
});
