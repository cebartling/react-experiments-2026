import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../support/world';
import type { Stock, StockApiResponse } from '../../src/types/stock';

interface ApiClientWorld extends PlaywrightWorld {
  mockStocks: Stock[];
  fetchResult: Stock[] | Stock | null;
  fetchError: Error | null;
  mockResponse: {
    status: number;
    body: unknown;
  } | null;
}

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

Given('the API server is available', async function (this: ApiClientWorld) {
  this.mockStocks = mockStocks;
  this.fetchResult = null;
  this.fetchError = null;
  this.mockResponse = null;
});

Given('the API returns a list of stocks', async function (this: ApiClientWorld) {
  const response: StockApiResponse = {
    data: this.mockStocks,
    meta: {
      timestamp: new Date().toISOString(),
      count: this.mockStocks.length,
    },
  };
  this.mockResponse = { status: 200, body: response };
});

Given(
  'the API returns stock data for {string}',
  async function (this: ApiClientWorld, symbol: string) {
    const stock = this.mockStocks.find((s) => s.symbol === symbol);
    if (stock) {
      this.mockResponse = { status: 200, body: stock };
    }
  }
);

Given('the API returns a 401 unauthorized error', async function (this: ApiClientWorld) {
  this.mockResponse = {
    status: 401,
    body: { code: 'AUTH_ERROR', message: 'Invalid API key' },
  };
});

Given('the API returns a 404 not found error for {string}', async function (this: ApiClientWorld) {
  this.mockResponse = {
    status: 404,
    body: { code: 'NOT_FOUND', message: 'Stock not found' },
  };
});

Given('the API returns a 429 rate limit error', async function (this: ApiClientWorld) {
  this.mockResponse = {
    status: 429,
    body: { code: 'RATE_LIMIT', message: 'Rate limit exceeded' },
  };
});

Given('the API server is unavailable', async function (this: ApiClientWorld) {
  this.mockResponse = null;
});

When('I fetch all stocks', async function (this: ApiClientWorld) {
  const result = await this.page.evaluate(async (mockResponse) => {
    const { fetchStocks } = await import('/src/api/stockApi');

    // Mock global fetch for this evaluation
    const originalFetch = window.fetch;
    window.fetch = async () => {
      return new Response(JSON.stringify(mockResponse.body), {
        status: mockResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    try {
      const stocks = await fetchStocks();
      window.fetch = originalFetch;
      return { success: true, data: stocks };
    } catch (error) {
      window.fetch = originalFetch;
      return { success: false, error: String(error) };
    }
  }, this.mockResponse);

  if (result.success) {
    this.fetchResult = result.data as Stock[];
  } else {
    this.fetchError = new Error(result.error);
  }
});

When('I attempt to fetch all stocks', async function (this: ApiClientWorld) {
  const result = await this.page.evaluate(async (mockResponse) => {
    const { fetchStocks, StockApiError } = await import('/src/api/index');

    const originalFetch = window.fetch;

    if (mockResponse === null) {
      // Simulate network error
      window.fetch = async () => {
        throw new Error('Network error');
      };
    } else {
      window.fetch = async () => {
        return new Response(JSON.stringify(mockResponse.body), {
          status: mockResponse.status,
          headers: { 'Content-Type': 'application/json' },
        });
      };
    }

    try {
      const stocks = await fetchStocks();
      window.fetch = originalFetch;
      return { success: true, data: stocks };
    } catch (error) {
      window.fetch = originalFetch;
      if (error instanceof StockApiError) {
        return {
          success: false,
          error: {
            message: error.message,
            statusCode: error.statusCode,
            code: error.code,
            isUnauthorized: error.isUnauthorized,
            isRateLimited: error.isRateLimited,
            isNetworkError: error.isNetworkError,
          },
        };
      }
      return { success: false, error: { message: String(error) } };
    }
  }, this.mockResponse);

  if (result.success) {
    this.fetchResult = result.data as Stock[];
  } else {
    this.fetchError = result.error as unknown as Error;
  }
});

When(
  'I fetch the stock with symbol {string}',
  async function (this: ApiClientWorld, symbol: string) {
    const result = await this.page.evaluate(
      async ({ mockResponse, symbol }) => {
        const { fetchStockBySymbol } = await import('/src/api/stockApi');

        const originalFetch = window.fetch;
        window.fetch = async () => {
          return new Response(JSON.stringify(mockResponse.body), {
            status: mockResponse.status,
            headers: { 'Content-Type': 'application/json' },
          });
        };

        try {
          const stock = await fetchStockBySymbol(symbol);
          window.fetch = originalFetch;
          return { success: true, data: stock };
        } catch (error) {
          window.fetch = originalFetch;
          return { success: false, error: String(error) };
        }
      },
      { mockResponse: this.mockResponse, symbol }
    );

    if (result.success) {
      this.fetchResult = result.data as Stock;
    } else {
      this.fetchError = new Error(result.error);
    }
  }
);

When(
  'I attempt to fetch the stock with symbol {string}',
  async function (this: ApiClientWorld, symbol: string) {
    const result = await this.page.evaluate(
      async ({ mockResponse, symbol }) => {
        const { fetchStockBySymbol, StockApiError } = await import('/src/api/index');

        const originalFetch = window.fetch;
        window.fetch = async () => {
          return new Response(JSON.stringify(mockResponse.body), {
            status: mockResponse.status,
            headers: { 'Content-Type': 'application/json' },
          });
        };

        try {
          const stock = await fetchStockBySymbol(symbol);
          window.fetch = originalFetch;
          return { success: true, data: stock };
        } catch (error) {
          window.fetch = originalFetch;
          if (error instanceof StockApiError) {
            return {
              success: false,
              error: {
                message: error.message,
                statusCode: error.statusCode,
                code: error.code,
              },
            };
          }
          return { success: false, error: { message: String(error) } };
        }
      },
      { mockResponse: this.mockResponse, symbol }
    );

    if (result.success) {
      this.fetchResult = result.data as Stock;
    } else {
      this.fetchError = result.error as unknown as Error;
    }
  }
);

Then('I should receive an array of stock data', async function (this: ApiClientWorld) {
  expect(this.fetchResult).not.toBeNull();
  expect(Array.isArray(this.fetchResult)).toBe(true);
  expect((this.fetchResult as Stock[]).length).toBeGreaterThan(0);
});

Then('each stock should have required properties', async function (this: ApiClientWorld) {
  const stocks = this.fetchResult as Stock[];
  for (const stock of stocks) {
    expect(stock).toHaveProperty('symbol');
    expect(stock).toHaveProperty('companyName');
    expect(stock).toHaveProperty('price');
    expect(stock).toHaveProperty('change');
    expect(stock).toHaveProperty('changePercent');
    expect(stock).toHaveProperty('volume');
    expect(stock).toHaveProperty('marketCap');
    expect(stock).toHaveProperty('high52Week');
    expect(stock).toHaveProperty('low52Week');
    expect(stock).toHaveProperty('lastUpdated');
  }
});

Then(
  'I should receive the stock data for {string}',
  async function (this: ApiClientWorld, symbol: string) {
    expect(this.fetchResult).not.toBeNull();
    const stock = this.fetchResult as Stock;
    expect(stock.symbol).toBe(symbol);
  }
);

Then('I should receive an unauthorized error', async function (this: ApiClientWorld) {
  expect(this.fetchError).not.toBeNull();
  const error = this.fetchError as { statusCode?: number };
  expect(error.statusCode).toBe(401);
});

Then('the error should indicate unauthorized access', async function (this: ApiClientWorld) {
  const error = this.fetchError as { isUnauthorized?: boolean };
  expect(error.isUnauthorized).toBe(true);
});

Then('I should receive a not found error', async function (this: ApiClientWorld) {
  expect(this.fetchError).not.toBeNull();
  const error = this.fetchError as { statusCode?: number };
  expect(error.statusCode).toBe(404);
});

Then('I should receive a rate limited error', async function (this: ApiClientWorld) {
  expect(this.fetchError).not.toBeNull();
  const error = this.fetchError as { statusCode?: number };
  expect(error.statusCode).toBe(429);
});

Then('the error should indicate rate limiting', async function (this: ApiClientWorld) {
  const error = this.fetchError as { isRateLimited?: boolean };
  expect(error.isRateLimited).toBe(true);
});

Then('I should receive a network error', async function (this: ApiClientWorld) {
  expect(this.fetchError).not.toBeNull();
  const error = this.fetchError as { isNetworkError?: boolean };
  expect(error.isNetworkError).toBe(true);
});
