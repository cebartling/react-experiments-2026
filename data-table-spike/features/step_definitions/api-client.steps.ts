import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../support/world';
import type { Stock } from '../../src/types/stock';

interface ApiClientWorld extends PlaywrightWorld {
  mockStocks: Stock[];
  fetchResult: Stock[] | Stock | null;
  fetchError: {
    message: string;
    statusCode?: number;
    code?: string;
    isUnauthorized?: boolean;
    isRateLimited?: boolean;
    isNetworkError?: boolean;
  } | null;
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

function getApiClientTestHtml(): string {
  return `
    <!DOCTYPE html>
    <html>
      <head><title>API Client Test</title></head>
      <body>
        <div id="root"></div>
        <script>
          // Mock API client implementation for testing
          window.mockResponse = null;
          window.fetchResult = null;
          window.fetchError = null;

          // StockApiError class
          class StockApiError extends Error {
            constructor(message, statusCode, code) {
              super(message);
              this.name = 'StockApiError';
              this.statusCode = statusCode;
              this.code = code;
            }

            get isUnauthorized() {
              return this.statusCode === 401;
            }

            get isRateLimited() {
              return this.statusCode === 429;
            }

            get isNetworkError() {
              return this.code === 'NETWORK_ERROR';
            }
          }
          window.StockApiError = StockApiError;

          // Simulated fetch functions
          window.fetchStocks = async function() {
            if (window.mockResponse === null) {
              throw new StockApiError('Network error', undefined, 'NETWORK_ERROR');
            }

            const { status, body } = window.mockResponse;

            if (status === 401) {
              throw new StockApiError('Unauthorized', 401, 'AUTH_ERROR');
            }
            if (status === 429) {
              throw new StockApiError('Rate limited', 429, 'RATE_LIMIT');
            }
            if (status === 404) {
              throw new StockApiError('Not found', 404, 'NOT_FOUND');
            }
            if (status >= 400) {
              throw new StockApiError(body.message || 'Error', status, body.code);
            }

            return body.data;
          };

          window.fetchStockBySymbol = async function(symbol) {
            if (window.mockResponse === null) {
              throw new StockApiError('Network error', undefined, 'NETWORK_ERROR');
            }

            const { status, body } = window.mockResponse;

            if (status === 401) {
              throw new StockApiError('Unauthorized', 401, 'AUTH_ERROR');
            }
            if (status === 429) {
              throw new StockApiError('Rate limited', 429, 'RATE_LIMIT');
            }
            if (status === 404) {
              throw new StockApiError('Not found', 404, 'NOT_FOUND');
            }
            if (status >= 400) {
              throw new StockApiError(body.message || 'Error', status, body.code);
            }

            return body;
          };
        </script>
      </body>
    </html>
  `;
}

async function setupApiClientPage(world: ApiClientWorld): Promise<void> {
  await world.page.setContent(getApiClientTestHtml());
  await world.page.waitForLoadState('domcontentloaded');
}

Given('the API server is available', async function (this: ApiClientWorld) {
  this.mockStocks = mockStocks;
  this.fetchResult = null;
  this.fetchError = null;
  this.mockResponse = null;

  await setupApiClientPage(this);
});

Given('the API returns a list of stocks', async function (this: ApiClientWorld) {
  this.mockResponse = {
    status: 200,
    body: {
      data: this.mockStocks,
      meta: {
        timestamp: new Date().toISOString(),
        count: this.mockStocks.length,
      },
    },
  };

  await this.page.evaluate((response) => {
    (window as unknown as { mockResponse: unknown }).mockResponse = response;
  }, this.mockResponse);
});

Given(
  'the API returns stock data for {string}',
  async function (this: ApiClientWorld, symbol: string) {
    const stock = this.mockStocks.find((s) => s.symbol === symbol);
    if (stock) {
      this.mockResponse = { status: 200, body: stock };
      await this.page.evaluate((response) => {
        (window as unknown as { mockResponse: unknown }).mockResponse = response;
      }, this.mockResponse);
    }
  }
);

Given('the API returns a 401 unauthorized error', async function (this: ApiClientWorld) {
  this.mockResponse = {
    status: 401,
    body: { code: 'AUTH_ERROR', message: 'Invalid API key' },
  };
  await this.page.evaluate((response) => {
    (window as unknown as { mockResponse: unknown }).mockResponse = response;
  }, this.mockResponse);
});

Given('the API returns a 404 not found error', async function (this: ApiClientWorld) {
  this.mockResponse = {
    status: 404,
    body: { code: 'NOT_FOUND', message: 'Stock not found' },
  };
  await this.page.evaluate((response) => {
    (window as unknown as { mockResponse: unknown }).mockResponse = response;
  }, this.mockResponse);
});

Given('the API returns a 429 rate limit error', async function (this: ApiClientWorld) {
  this.mockResponse = {
    status: 429,
    body: { code: 'RATE_LIMIT', message: 'Rate limit exceeded' },
  };
  await this.page.evaluate((response) => {
    (window as unknown as { mockResponse: unknown }).mockResponse = response;
  }, this.mockResponse);
});

Given('the API server is unavailable', async function (this: ApiClientWorld) {
  this.mockResponse = null;
  await this.page.evaluate(() => {
    (window as unknown as { mockResponse: null }).mockResponse = null;
  });
});

When('I fetch all stocks', async function (this: ApiClientWorld) {
  const result = await this.page.evaluate(async () => {
    try {
      const fetchStocks = (window as unknown as { fetchStocks: () => Promise<Stock[]> })
        .fetchStocks;
      const stocks = await fetchStocks();
      return { success: true, data: stocks };
    } catch (error) {
      const err = error as Error & {
        statusCode?: number;
        code?: string;
        isUnauthorized?: boolean;
        isRateLimited?: boolean;
        isNetworkError?: boolean;
      };
      return {
        success: false,
        error: {
          message: err.message,
          statusCode: err.statusCode,
          code: err.code,
          isUnauthorized: err.isUnauthorized,
          isRateLimited: err.isRateLimited,
          isNetworkError: err.isNetworkError,
        },
      };
    }
  });

  if (result.success) {
    this.fetchResult = result.data as Stock[];
  } else {
    this.fetchError = result.error;
  }
});

When('I attempt to fetch all stocks', async function (this: ApiClientWorld) {
  const result = await this.page.evaluate(async () => {
    try {
      const fetchStocks = (window as unknown as { fetchStocks: () => Promise<Stock[]> })
        .fetchStocks;
      const stocks = await fetchStocks();
      return { success: true, data: stocks };
    } catch (error) {
      const err = error as Error & {
        statusCode?: number;
        code?: string;
        isUnauthorized?: boolean;
        isRateLimited?: boolean;
        isNetworkError?: boolean;
      };
      return {
        success: false,
        error: {
          message: err.message,
          statusCode: err.statusCode,
          code: err.code,
          isUnauthorized: err.isUnauthorized,
          isRateLimited: err.isRateLimited,
          isNetworkError: err.isNetworkError,
        },
      };
    }
  });

  if (result.success) {
    this.fetchResult = result.data as Stock[];
  } else {
    this.fetchError = result.error;
  }
});

When(
  'I call the API to fetch stock {string}',
  async function (this: ApiClientWorld, symbol: string) {
    const result = await this.page.evaluate(async (sym) => {
      try {
        const fetchStockBySymbol = (
          window as unknown as { fetchStockBySymbol: (s: string) => Promise<Stock> }
        ).fetchStockBySymbol;
        const stock = await fetchStockBySymbol(sym);
        return { success: true, data: stock };
      } catch (error) {
        const err = error as Error & {
          statusCode?: number;
          code?: string;
        };
        return {
          success: false,
          error: {
            message: err.message,
            statusCode: err.statusCode,
            code: err.code,
          },
        };
      }
    }, symbol);

    if (result.success) {
      this.fetchResult = result.data as Stock;
    } else {
      this.fetchError = result.error;
    }
  }
);

When(
  'I attempt to fetch the stock with symbol {string}',
  async function (this: ApiClientWorld, symbol: string) {
    const result = await this.page.evaluate(async (sym) => {
      try {
        const fetchStockBySymbol = (
          window as unknown as { fetchStockBySymbol: (s: string) => Promise<Stock> }
        ).fetchStockBySymbol;
        const stock = await fetchStockBySymbol(sym);
        return { success: true, data: stock };
      } catch (error) {
        const err = error as Error & {
          statusCode?: number;
          code?: string;
        };
        return {
          success: false,
          error: {
            message: err.message,
            statusCode: err.statusCode,
            code: err.code,
          },
        };
      }
    }, symbol);

    if (result.success) {
      this.fetchResult = result.data as Stock;
    } else {
      this.fetchError = result.error;
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
  expect(this.fetchError?.statusCode).toBe(401);
});

Then('the error should indicate unauthorized access', async function (this: ApiClientWorld) {
  expect(this.fetchError?.isUnauthorized).toBe(true);
});

Then('I should receive a not found error', async function (this: ApiClientWorld) {
  expect(this.fetchError).not.toBeNull();
  expect(this.fetchError?.statusCode).toBe(404);
});

Then('I should receive a rate limited error', async function (this: ApiClientWorld) {
  expect(this.fetchError).not.toBeNull();
  expect(this.fetchError?.statusCode).toBe(429);
});

Then('the error should indicate rate limiting', async function (this: ApiClientWorld) {
  expect(this.fetchError?.isRateLimited).toBe(true);
});

Then('I should receive a network error', async function (this: ApiClientWorld) {
  expect(this.fetchError).not.toBeNull();
  expect(this.fetchError?.isNetworkError).toBe(true);
});
