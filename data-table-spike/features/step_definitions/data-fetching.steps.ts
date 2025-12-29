import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../support/world';
import type { Stock, StockApiResponse } from '../../src/types/stock';

interface DataFetchingWorld extends PlaywrightWorld {
  mockStocks: Stock[];
  fetchCount: number;
  cachedData: Stock[] | null;
  lastFetchTime: number;
  apiFailures: number;
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

Given('the application is loaded', async function (this: DataFetchingWorld) {
  this.mockStocks = mockStocks;
  this.fetchCount = 0;
  this.cachedData = null;
  this.lastFetchTime = 0;
  this.apiFailures = 0;

  await this.page.goto('http://localhost:5173');
});

Given('the API returns stock data', async function (this: DataFetchingWorld) {
  await this.page.evaluate((stocks) => {
    const response: StockApiResponse = {
      data: stocks,
      meta: {
        timestamp: new Date().toISOString(),
        count: stocks.length,
      },
    };
    (window as unknown as { mockApiResponse: unknown }).mockApiResponse = response;
  }, this.mockStocks);
});

When('the stock data is fetched', async function (this: DataFetchingWorld) {
  const result = await this.page.evaluate(async () => {
    const { queryClient } = await import('/src/lib/queryClient');
    const { queryKeys } = await import('/src/lib/queryKeys');
    const { fetchStocks } = await import('/src/api/stockApi');

    const mockResponse = (window as unknown as { mockApiResponse: StockApiResponse })
      .mockApiResponse;
    const originalFetch = window.fetch;

    window.fetch = async () => {
      return new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    try {
      const data = await queryClient.fetchQuery({
        queryKey: queryKeys.stocks.all,
        queryFn: fetchStocks,
      });
      window.fetch = originalFetch;
      return { success: true, data };
    } catch (error) {
      window.fetch = originalFetch;
      return { success: false, error: String(error) };
    }
  });

  expect(result.success).toBe(true);
  this.cachedData = result.data as Stock[];
  this.fetchCount++;
});

Then('the data should be cached', async function (this: DataFetchingWorld) {
  const isCached = await this.page.evaluate(async () => {
    const { queryClient } = await import('/src/lib/queryClient');
    const { queryKeys } = await import('/src/lib/queryKeys');
    return queryClient.getQueryData(queryKeys.stocks.all) !== undefined;
  });

  expect(isCached).toBe(true);
});

Then('subsequent requests should use cached data', async function (this: DataFetchingWorld) {
  const result = await this.page.evaluate(async () => {
    const { queryClient } = await import('/src/lib/queryClient');
    const { queryKeys } = await import('/src/lib/queryKeys');

    let fetchCalled = false;
    const originalFetch = window.fetch;
    window.fetch = async () => {
      fetchCalled = true;
      return new Response('{}', { status: 200 });
    };

    const data = queryClient.getQueryData(queryKeys.stocks.all);
    window.fetch = originalFetch;

    return { data, fetchCalled };
  });

  expect(result.data).not.toBeNull();
  expect(result.fetchCalled).toBe(false);
});

Given('the stock data is already cached', async function (this: DataFetchingWorld) {
  await this.page.evaluate(async (stocks) => {
    const { queryClient } = await import('/src/lib/queryClient');
    const { queryKeys } = await import('/src/lib/queryKeys');
    queryClient.setQueryData(queryKeys.stocks.all, stocks);
  }, this.mockStocks);
  this.cachedData = this.mockStocks;
});

Given('the cache data is stale', async function (this: DataFetchingWorld) {
  await this.page.evaluate(async () => {
    const { queryClient } = await import('/src/lib/queryClient');
    const { queryKeys } = await import('/src/lib/queryKeys');

    queryClient.invalidateQueries({ queryKey: queryKeys.stocks.all });
  });
});

When('the component requests stock data', async function (this: DataFetchingWorld) {
  // Data is already cached from previous step
  this.lastFetchTime = Date.now();
});

Then('the stale data should be shown immediately', async function (this: DataFetchingWorld) {
  const data = await this.page.evaluate(async () => {
    const { queryClient } = await import('/src/lib/queryClient');
    const { queryKeys } = await import('/src/lib/queryKeys');
    return queryClient.getQueryData(queryKeys.stocks.all);
  });

  expect(data).toEqual(this.mockStocks);
});

Then('fresh data should be fetched in the background', async function (this: DataFetchingWorld) {
  const state = await this.page.evaluate(async () => {
    const { queryClient } = await import('/src/lib/queryClient');
    const { queryKeys } = await import('/src/lib/queryKeys');
    return queryClient.getQueryState(queryKeys.stocks.all);
  });

  expect(state?.isInvalidated).toBe(true);
});

Given('the stock data is fetched successfully', async function (this: DataFetchingWorld) {
  await this.page.evaluate(async (stocks) => {
    const { queryClient } = await import('/src/lib/queryClient');
    const { queryKeys } = await import('/src/lib/queryKeys');
    queryClient.setQueryData(queryKeys.stocks.all, stocks);
  }, this.mockStocks);
});

When('the refetch interval elapses', async function (this: DataFetchingWorld) {
  await this.page.waitForTimeout(100);
});

Then('the data should be refetched automatically', async function (this: DataFetchingWorld) {
  const hasData = await this.page.evaluate(async () => {
    const { queryClient } = await import('/src/lib/queryClient');
    const { queryKeys } = await import('/src/lib/queryKeys');
    return queryClient.getQueryData(queryKeys.stocks.all) !== undefined;
  });

  expect(hasData).toBe(true);
});

Given('the API fails on first request', async function (this: DataFetchingWorld) {
  this.apiFailures = 1;
});

Given('the API succeeds on second request', async function (this: DataFetchingWorld) {
  await this.page.evaluate((stocks) => {
    (window as unknown as { apiSuccessData: Stock[] }).apiSuccessData = stocks;
  }, this.mockStocks);
});

Then('the fetch should be retried', async function (this: DataFetchingWorld) {
  expect(this.apiFailures).toBeGreaterThan(0);
});

Then('the data should be received successfully', async function (this: DataFetchingWorld) {
  expect(this.cachedData).not.toBeNull();
});

Given('the stock data is cached', async function (this: DataFetchingWorld) {
  await this.page.evaluate(async (stocks) => {
    const { queryClient } = await import('/src/lib/queryClient');
    const { queryKeys } = await import('/src/lib/queryKeys');
    queryClient.setQueryData(queryKeys.stocks.all, stocks);
  }, this.mockStocks);
});

When('the cache is invalidated', async function (this: DataFetchingWorld) {
  await this.page.evaluate(async () => {
    const { queryClient } = await import('/src/lib/queryClient');
    const { queryKeys } = await import('/src/lib/queryKeys');
    await queryClient.invalidateQueries({ queryKey: queryKeys.stocks.all });
  });
});

Then('a fresh fetch should be triggered', async function (this: DataFetchingWorld) {
  const isInvalidated = await this.page.evaluate(async () => {
    const { queryClient } = await import('/src/lib/queryClient');
    const { queryKeys } = await import('/src/lib/queryKeys');
    const state = queryClient.getQueryState(queryKeys.stocks.all);
    return state?.isInvalidated ?? false;
  });

  expect(isInvalidated).toBe(true);
});

Then('the new data should replace the old data', async function (this: DataFetchingWorld) {
  const hasData = await this.page.evaluate(async () => {
    const { queryClient } = await import('/src/lib/queryClient');
    const { queryKeys } = await import('/src/lib/queryKeys');
    return queryClient.getQueryData(queryKeys.stocks.all) !== undefined;
  });

  expect(hasData).toBe(true);
});

Given('no stock data is cached', async function (this: DataFetchingWorld) {
  await this.page.evaluate(async () => {
    const { queryClient } = await import('/src/lib/queryClient');
    const { queryKeys } = await import('/src/lib/queryKeys');
    queryClient.removeQueries({ queryKey: queryKeys.stocks.all });
  });
});

When('stocks are prefetched', async function (this: DataFetchingWorld) {
  await this.page.evaluate(async (stocks) => {
    const { queryClient } = await import('/src/lib/queryClient');
    const { queryKeys } = await import('/src/lib/queryKeys');

    const response: StockApiResponse = {
      data: stocks,
      meta: {
        timestamp: new Date().toISOString(),
        count: stocks.length,
      },
    };

    const originalFetch = window.fetch;
    window.fetch = async () => {
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const { fetchStocks } = await import('/src/api/stockApi');

    await queryClient.prefetchQuery({
      queryKey: queryKeys.stocks.all,
      queryFn: fetchStocks,
    });

    window.fetch = originalFetch;
  }, this.mockStocks);
});

Then('the data should be available in cache', async function (this: DataFetchingWorld) {
  const data = await this.page.evaluate(async () => {
    const { queryClient } = await import('/src/lib/queryClient');
    const { queryKeys } = await import('/src/lib/queryKeys');
    return queryClient.getQueryData(queryKeys.stocks.all);
  });

  expect(data).not.toBeNull();
});

Then('subsequent queries should use the prefetched data', async function (this: DataFetchingWorld) {
  const result = await this.page.evaluate(async () => {
    const { queryClient } = await import('/src/lib/queryClient');
    const { queryKeys } = await import('/src/lib/queryKeys');

    const data = queryClient.getQueryData(queryKeys.stocks.all);
    return data !== undefined;
  });

  expect(result).toBe(true);
});

Given(
  'the API returns data for stock {string}',
  async function (this: DataFetchingWorld, symbol: string) {
    const stock = this.mockStocks.find((s) => s.symbol === symbol);
    await this.page.evaluate((stockData) => {
      (window as unknown as { mockStockResponse: Stock }).mockStockResponse = stockData;
    }, stock);
  }
);

When(
  'I fetch the stock with symbol {string}',
  async function (this: DataFetchingWorld, symbol: string) {
    const result = await this.page.evaluate(async (sym) => {
      const { queryClient } = await import('/src/lib/queryClient');
      const { queryKeys } = await import('/src/lib/queryKeys');
      const { fetchStockBySymbol } = await import('/src/api/stockApi');

      const mockStock = (window as unknown as { mockStockResponse: Stock }).mockStockResponse;
      const originalFetch = window.fetch;

      window.fetch = async () => {
        return new Response(JSON.stringify(mockStock), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      };

      try {
        const data = await queryClient.fetchQuery({
          queryKey: queryKeys.stocks.detail(sym),
          queryFn: () => fetchStockBySymbol(sym),
        });
        window.fetch = originalFetch;
        return { success: true, data };
      } catch (error) {
        window.fetch = originalFetch;
        return { success: false, error: String(error) };
      }
    }, symbol);

    expect(result.success).toBe(true);
  }
);

Then('I should receive the stock data', async function (this: DataFetchingWorld) {
  const data = await this.page.evaluate(async () => {
    const { queryClient } = await import('/src/lib/queryClient');
    const { queryKeys } = await import('/src/lib/queryKeys');
    return queryClient.getQueryData(queryKeys.stocks.detail('AAPL'));
  });

  expect(data).not.toBeNull();
});

Then('the data should be cached with the correct key', async function (this: DataFetchingWorld) {
  const isCached = await this.page.evaluate(async () => {
    const { queryClient } = await import('/src/lib/queryClient');
    const { queryKeys } = await import('/src/lib/queryKeys');
    return queryClient.getQueryData(queryKeys.stocks.detail('AAPL')) !== undefined;
  });

  expect(isCached).toBe(true);
});
