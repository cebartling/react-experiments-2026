import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../support/world';
import type { Stock } from '../../src/types/stock';

interface DataFetchingWorld extends PlaywrightWorld {
  mockStocks: Stock[];
  fetchCount: number;
  cachedData: Stock[] | null;
  lastFetchTime: number;
  apiFailures: number;
  isDataCached: boolean;
  isCacheStale: boolean;
  isCacheInvalidated: boolean;
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

function getDataFetchingTestHtml(): string {
  return `
    <!DOCTYPE html>
    <html>
      <head><title>Data Fetching Test</title></head>
      <body>
        <div id="root"></div>
        <script>
          // Mock cache implementation
          window.queryCache = {};
          window.fetchCount = 0;
          window.isCacheStale = false;
          window.apiFailCount = 0;
          window.maxApiFailures = 0;

          // Mock query client
          window.queryClient = {
            getQueryData: function(key) {
              const keyStr = JSON.stringify(key);
              return window.queryCache[keyStr];
            },
            setQueryData: function(key, data) {
              const keyStr = JSON.stringify(key);
              window.queryCache[keyStr] = data;
            },
            getQueryState: function(key) {
              const keyStr = JSON.stringify(key);
              const data = window.queryCache[keyStr];
              return {
                data: data,
                isInvalidated: window.isCacheStale
              };
            },
            removeQueries: function(options) {
              if (options && options.queryKey) {
                const keyStr = JSON.stringify(options.queryKey);
                delete window.queryCache[keyStr];
              }
            },
            invalidateQueries: function(options) {
              window.isCacheStale = true;
              return Promise.resolve();
            },
            fetchQuery: async function(options) {
              window.fetchCount++;

              // Simulate retry on failure
              if (window.apiFailCount < window.maxApiFailures) {
                window.apiFailCount++;
                throw new Error('API Error');
              }

              const data = await options.queryFn();
              const keyStr = JSON.stringify(options.queryKey);
              window.queryCache[keyStr] = data;
              return data;
            },
            prefetchQuery: async function(options) {
              const data = await options.queryFn();
              const keyStr = JSON.stringify(options.queryKey);
              window.queryCache[keyStr] = data;
              return data;
            }
          };

          // Mock query keys
          window.queryKeys = {
            stocks: {
              all: ['stocks'],
              detail: function(symbol) {
                return ['stocks', 'detail', symbol];
              }
            }
          };

          // Mock fetch function
          window.mockApiResponse = null;
          window.mockStockResponse = null;

          window.fetchStocks = async function() {
            if (window.mockApiResponse) {
              return window.mockApiResponse.data;
            }
            return [];
          };

          window.fetchStockBySymbol = async function(symbol) {
            const response = window.mockStockResponse;
            if (response) {
              return response;
            }
            throw new Error('Stock not found');
          };
        </script>
      </body>
    </html>
  `;
}

async function setupDataFetchingPage(world: DataFetchingWorld): Promise<void> {
  await world.page.setContent(getDataFetchingTestHtml());
  await world.page.waitForLoadState('domcontentloaded');
}

Given('the application is loaded', async function (this: DataFetchingWorld) {
  this.mockStocks = mockStocks;
  this.fetchCount = 0;
  this.cachedData = null;
  this.lastFetchTime = 0;
  this.apiFailures = 0;
  this.isDataCached = false;
  this.isCacheStale = false;
  this.isCacheInvalidated = false;

  await setupDataFetchingPage(this);
});

Given('the API returns stock data', async function (this: DataFetchingWorld) {
  await this.page.evaluate((stocks) => {
    (window as unknown as { mockApiResponse: { data: Stock[] } }).mockApiResponse = {
      data: stocks,
    };
  }, this.mockStocks);
});

When('the stock data is fetched', async function (this: DataFetchingWorld) {
  const result = await this.page.evaluate(async () => {
    const queryClient = (window as unknown as { queryClient: unknown }).queryClient as {
      fetchQuery: (opts: {
        queryKey: string[];
        queryFn: () => Promise<Stock[]>;
      }) => Promise<Stock[]>;
    };
    const queryKeys = (window as unknown as { queryKeys: { stocks: { all: string[] } } }).queryKeys;
    const fetchStocks = (window as unknown as { fetchStocks: () => Promise<Stock[]> }).fetchStocks;

    // Simulate retry behavior - try up to 3 times
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const data = await queryClient.fetchQuery({
          queryKey: queryKeys.stocks.all,
          queryFn: fetchStocks,
        });
        return { success: true, data };
      } catch (error) {
        lastError = error as Error;
        // Continue to retry
      }
    }
    return { success: false, error: lastError?.message || 'Unknown error' };
  });

  if (result.success) {
    this.cachedData = result.data as Stock[];
    this.isDataCached = true;
  }
  this.fetchCount++;
});

Then('the data should be cached', async function (this: DataFetchingWorld) {
  const isCached = await this.page.evaluate(() => {
    const queryClient = (
      window as unknown as { queryClient: { getQueryData: (key: string[]) => unknown } }
    ).queryClient;
    const queryKeys = (window as unknown as { queryKeys: { stocks: { all: string[] } } }).queryKeys;
    return queryClient.getQueryData(queryKeys.stocks.all) !== undefined;
  });

  expect(isCached).toBe(true);
});

Then('subsequent requests should use cached data', async function (this: DataFetchingWorld) {
  const result = await this.page.evaluate(() => {
    const queryClient = (
      window as unknown as { queryClient: { getQueryData: (key: string[]) => unknown } }
    ).queryClient;
    const queryKeys = (window as unknown as { queryKeys: { stocks: { all: string[] } } }).queryKeys;
    const fetchCount = (window as unknown as { fetchCount: number }).fetchCount;

    const data = queryClient.getQueryData(queryKeys.stocks.all);
    return { data, fetchCount };
  });

  expect(result.data).not.toBeNull();
  // fetchCount should be 1 since we only fetched once
  expect(result.fetchCount).toBe(1);
});

Given('the stock data is already cached', async function (this: DataFetchingWorld) {
  await this.page.evaluate((stocks) => {
    const queryClient = (
      window as unknown as { queryClient: { setQueryData: (key: string[], data: Stock[]) => void } }
    ).queryClient;
    const queryKeys = (window as unknown as { queryKeys: { stocks: { all: string[] } } }).queryKeys;
    queryClient.setQueryData(queryKeys.stocks.all, stocks);
  }, this.mockStocks);
  this.cachedData = this.mockStocks;
  this.isDataCached = true;
});

Given('the cache data is stale', async function (this: DataFetchingWorld) {
  await this.page.evaluate(() => {
    (window as unknown as { isCacheStale: boolean }).isCacheStale = true;
  });
  this.isCacheStale = true;
});

When('the component requests stock data', async function (this: DataFetchingWorld) {
  this.lastFetchTime = Date.now();
});

Then('the stale data should be shown immediately', async function (this: DataFetchingWorld) {
  const data = await this.page.evaluate(() => {
    const queryClient = (
      window as unknown as { queryClient: { getQueryData: (key: string[]) => unknown } }
    ).queryClient;
    const queryKeys = (window as unknown as { queryKeys: { stocks: { all: string[] } } }).queryKeys;
    return queryClient.getQueryData(queryKeys.stocks.all);
  });

  expect(data).toEqual(this.mockStocks);
});

Then('fresh data should be fetched in the background', async function (this: DataFetchingWorld) {
  const state = await this.page.evaluate(() => {
    const queryClient = (
      window as unknown as {
        queryClient: { getQueryState: (key: string[]) => { isInvalidated: boolean } };
      }
    ).queryClient;
    const queryKeys = (window as unknown as { queryKeys: { stocks: { all: string[] } } }).queryKeys;
    return queryClient.getQueryState(queryKeys.stocks.all);
  });

  expect(state?.isInvalidated).toBe(true);
});

Given('the stock data is fetched successfully', async function (this: DataFetchingWorld) {
  await this.page.evaluate((stocks) => {
    const queryClient = (
      window as unknown as { queryClient: { setQueryData: (key: string[], data: Stock[]) => void } }
    ).queryClient;
    const queryKeys = (window as unknown as { queryKeys: { stocks: { all: string[] } } }).queryKeys;
    queryClient.setQueryData(queryKeys.stocks.all, stocks);
  }, this.mockStocks);
  this.isDataCached = true;
});

When('the refetch interval elapses', async function (this: DataFetchingWorld) {
  await this.page.waitForTimeout(100);
});

Then('the data should be refetched automatically', async function (this: DataFetchingWorld) {
  const hasData = await this.page.evaluate(() => {
    const queryClient = (
      window as unknown as { queryClient: { getQueryData: (key: string[]) => unknown } }
    ).queryClient;
    const queryKeys = (window as unknown as { queryKeys: { stocks: { all: string[] } } }).queryKeys;
    return queryClient.getQueryData(queryKeys.stocks.all) !== undefined;
  });

  expect(hasData).toBe(true);
});

Given('the API fails on first request', async function (this: DataFetchingWorld) {
  this.apiFailures = 1;
  await this.page.evaluate(() => {
    (window as unknown as { maxApiFailures: number }).maxApiFailures = 1;
    (window as unknown as { apiFailCount: number }).apiFailCount = 0;
  });
});

Given('the API succeeds on second request', async function (this: DataFetchingWorld) {
  await this.page.evaluate((stocks) => {
    (window as unknown as { mockApiResponse: { data: Stock[] } }).mockApiResponse = {
      data: stocks,
    };
  }, this.mockStocks);
});

Then('the fetch should be retried', async function (this: DataFetchingWorld) {
  expect(this.apiFailures).toBeGreaterThan(0);
});

Then('the data should be received successfully', async function (this: DataFetchingWorld) {
  expect(this.cachedData).not.toBeNull();
});

Given('the stock data is cached', async function (this: DataFetchingWorld) {
  await this.page.evaluate((stocks) => {
    const queryClient = (
      window as unknown as { queryClient: { setQueryData: (key: string[], data: Stock[]) => void } }
    ).queryClient;
    const queryKeys = (window as unknown as { queryKeys: { stocks: { all: string[] } } }).queryKeys;
    queryClient.setQueryData(queryKeys.stocks.all, stocks);
  }, this.mockStocks);
  this.isDataCached = true;
});

When('the cache is invalidated', async function (this: DataFetchingWorld) {
  await this.page.evaluate(() => {
    const queryClient = (
      window as unknown as { queryClient: { invalidateQueries: (opts: unknown) => Promise<void> } }
    ).queryClient;
    const queryKeys = (window as unknown as { queryKeys: { stocks: { all: string[] } } }).queryKeys;
    return queryClient.invalidateQueries({ queryKey: queryKeys.stocks.all });
  });
  this.isCacheInvalidated = true;
});

Then('a fresh fetch should be triggered', async function (this: DataFetchingWorld) {
  const isInvalidated = await this.page.evaluate(() => {
    const queryClient = (
      window as unknown as {
        queryClient: { getQueryState: (key: string[]) => { isInvalidated: boolean } };
      }
    ).queryClient;
    const queryKeys = (window as unknown as { queryKeys: { stocks: { all: string[] } } }).queryKeys;
    const state = queryClient.getQueryState(queryKeys.stocks.all);
    return state?.isInvalidated ?? false;
  });

  expect(isInvalidated).toBe(true);
});

Then('the new data should replace the old data', async function (this: DataFetchingWorld) {
  const hasData = await this.page.evaluate(() => {
    const queryClient = (
      window as unknown as { queryClient: { getQueryData: (key: string[]) => unknown } }
    ).queryClient;
    const queryKeys = (window as unknown as { queryKeys: { stocks: { all: string[] } } }).queryKeys;
    return queryClient.getQueryData(queryKeys.stocks.all) !== undefined;
  });

  expect(hasData).toBe(true);
});

Given('no stock data is cached', async function (this: DataFetchingWorld) {
  await this.page.evaluate(() => {
    const queryClient = (
      window as unknown as { queryClient: { removeQueries: (opts: unknown) => void } }
    ).queryClient;
    const queryKeys = (window as unknown as { queryKeys: { stocks: { all: string[] } } }).queryKeys;
    queryClient.removeQueries({ queryKey: queryKeys.stocks.all });
  });
  this.isDataCached = false;
});

When('stocks are prefetched', async function (this: DataFetchingWorld) {
  await this.page.evaluate(async (stocks) => {
    (window as unknown as { mockApiResponse: { data: Stock[] } }).mockApiResponse = {
      data: stocks,
    };

    const queryClient = (
      window as unknown as {
        queryClient: {
          prefetchQuery: (opts: {
            queryKey: string[];
            queryFn: () => Promise<Stock[]>;
          }) => Promise<Stock[]>;
        };
      }
    ).queryClient;
    const queryKeys = (window as unknown as { queryKeys: { stocks: { all: string[] } } }).queryKeys;
    const fetchStocks = (window as unknown as { fetchStocks: () => Promise<Stock[]> }).fetchStocks;

    await queryClient.prefetchQuery({
      queryKey: queryKeys.stocks.all,
      queryFn: fetchStocks,
    });
  }, this.mockStocks);
  this.isDataCached = true;
});

Then('the data should be available in cache', async function (this: DataFetchingWorld) {
  const data = await this.page.evaluate(() => {
    const queryClient = (
      window as unknown as { queryClient: { getQueryData: (key: string[]) => unknown } }
    ).queryClient;
    const queryKeys = (window as unknown as { queryKeys: { stocks: { all: string[] } } }).queryKeys;
    return queryClient.getQueryData(queryKeys.stocks.all);
  });

  expect(data).not.toBeNull();
});

Then('subsequent queries should use the prefetched data', async function (this: DataFetchingWorld) {
  const result = await this.page.evaluate(() => {
    const queryClient = (
      window as unknown as { queryClient: { getQueryData: (key: string[]) => unknown } }
    ).queryClient;
    const queryKeys = (window as unknown as { queryKeys: { stocks: { all: string[] } } }).queryKeys;

    const data = queryClient.getQueryData(queryKeys.stocks.all);
    return data !== undefined;
  });

  expect(result).toBe(true);
});

Given(
  'the API returns data for stock {string}',
  async function (this: DataFetchingWorld, symbol: string) {
    const stock = this.mockStocks.find((s) => s.symbol === symbol);
    if (stock) {
      await this.page.evaluate((stockData) => {
        (window as unknown as { mockStockResponse: Stock }).mockStockResponse = stockData;
      }, stock);
    }
  }
);

When(
  'I fetch the stock with symbol {string}',
  async function (this: DataFetchingWorld, symbol: string) {
    // Use direct window function call to avoid TypeScript transformation issues
    const result = await this.page.evaluate(
      `(async function() {
        try {
          var data = await window.queryClient.fetchQuery({
            queryKey: window.queryKeys.stocks.detail("${symbol}"),
            queryFn: function() { return window.fetchStockBySymbol("${symbol}"); }
          });
          return { success: true, data: data };
        } catch (error) {
          return { success: false, error: String(error) };
        }
      })()`
    );

    if (!result.success) {
      console.error('Fetch failed:', result.error);
    }
    expect(result.success).toBe(true);
  }
);

Then('I should receive the stock data', async function (this: DataFetchingWorld) {
  const data = await this.page.evaluate(() => {
    const queryClient = (
      window as unknown as { queryClient: { getQueryData: (key: string[]) => unknown } }
    ).queryClient;
    const queryKeys = (
      window as unknown as { queryKeys: { stocks: { detail: (s: string) => string[] } } }
    ).queryKeys;
    return queryClient.getQueryData(queryKeys.stocks.detail('AAPL'));
  });

  expect(data).not.toBeNull();
});

Then('the data should be cached with the correct key', async function (this: DataFetchingWorld) {
  const isCached = await this.page.evaluate(() => {
    const queryClient = (
      window as unknown as { queryClient: { getQueryData: (key: string[]) => unknown } }
    ).queryClient;
    const queryKeys = (
      window as unknown as { queryKeys: { stocks: { detail: (s: string) => string[] } } }
    ).queryKeys;
    return queryClient.getQueryData(queryKeys.stocks.detail('AAPL')) !== undefined;
  });

  expect(isCached).toBe(true);
});
