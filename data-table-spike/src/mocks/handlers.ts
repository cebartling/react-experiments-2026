import { http, HttpResponse, delay } from 'msw';
import { largeStockDataset } from './stockDataGenerator';
import type { Stock, StockApiResponse, PaginatedStockApiResponse } from '../types/stock';

const API_BASE_URL = 'https://api.example.com/v1';

/**
 * Default page size for paginated requests
 */
const DEFAULT_PAGE_SIZE = 50;

/**
 * Maximum allowed page size
 */
const MAX_PAGE_SIZE = 100;

/**
 * Filters stocks by search query (symbol or company name)
 */
function filterStocks(stocks: Stock[], search: string): Stock[] {
  if (!search) return stocks;

  const searchLower = search.toLowerCase();
  return stocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchLower) ||
      stock.companyName.toLowerCase().includes(searchLower)
  );
}

/**
 * Sorts stocks by the specified field and order
 */
function sortStocks(
  stocks: Stock[],
  sortBy: keyof Stock | null,
  sortOrder: 'asc' | 'desc'
): Stock[] {
  if (!sortBy) return stocks;

  return [...stocks].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });
}

export const handlers = [
  // GET /stocks - Fetch all stocks (legacy endpoint, returns all data)
  http.get(`${API_BASE_URL}/stocks`, async ({ request }) => {
    const url = new URL(request.url);

    // Check if pagination parameters are present
    const pageParam = url.searchParams.get('page');

    // If pagination params exist, use the paginated handler logic
    if (pageParam !== null) {
      return handlePaginatedRequest(url);
    }

    // Legacy behavior: return all stocks
    await delay(200);

    const response: StockApiResponse = {
      data: largeStockDataset,
      meta: {
        timestamp: new Date().toISOString(),
        count: largeStockDataset.length,
      },
    };

    return HttpResponse.json(response);
  }),

  // GET /stocks/paginated - Paginated stock endpoint
  http.get(`${API_BASE_URL}/stocks/paginated`, async ({ request }) => {
    const url = new URL(request.url);
    return handlePaginatedRequest(url);
  }),

  // GET /stocks/:symbol - Fetch single stock
  http.get(`${API_BASE_URL}/stocks/:symbol`, async ({ params }) => {
    await delay(100);

    const { symbol } = params;
    const stock = largeStockDataset.find(
      (s) => s.symbol.toLowerCase() === (symbol as string).toLowerCase()
    );

    if (!stock) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: `Stock ${symbol} not found` },
        { status: 404 }
      );
    }

    return HttpResponse.json(stock);
  }),
];

/**
 * Handles paginated stock requests with filtering and sorting
 */
async function handlePaginatedRequest(url: URL): Promise<Response> {
  // Simulate network delay (shorter for subsequent pages)
  const page = parseInt(url.searchParams.get('page') ?? '0', 10);
  await delay(page === 0 ? 300 : 150);

  // Parse pagination parameters
  const pageSize = Math.min(
    parseInt(url.searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10),
    MAX_PAGE_SIZE
  );
  const search = url.searchParams.get('search') ?? '';
  const sortBy = (url.searchParams.get('sortBy') as keyof Stock) || null;
  const sortOrder = (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  // Apply filtering
  let filteredStocks = filterStocks(largeStockDataset, search);

  // Apply sorting
  filteredStocks = sortStocks(filteredStocks, sortBy, sortOrder);

  // Calculate pagination
  const totalCount = filteredStocks.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;
  const pageData = filteredStocks.slice(startIndex, endIndex);

  const response: PaginatedStockApiResponse = {
    data: pageData,
    meta: {
      timestamp: new Date().toISOString(),
      count: pageData.length,
      totalCount,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages - 1,
      hasPreviousPage: page > 0,
    },
  };

  return HttpResponse.json(response);
}
