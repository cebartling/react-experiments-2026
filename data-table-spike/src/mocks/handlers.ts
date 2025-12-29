import { http, HttpResponse, delay } from 'msw';
import { mockStocks } from './data';
import type { StockApiResponse } from '../types/stock';

const API_BASE_URL = 'https://api.example.com/v1';

export const handlers = [
  // GET /stocks - Fetch all stocks
  http.get(`${API_BASE_URL}/stocks`, async () => {
    // Simulate network delay
    await delay(200);

    const response: StockApiResponse = {
      data: mockStocks,
      meta: {
        timestamp: new Date().toISOString(),
        count: mockStocks.length,
      },
    };

    return HttpResponse.json(response);
  }),

  // GET /stocks/:symbol - Fetch single stock
  http.get(`${API_BASE_URL}/stocks/:symbol`, async ({ params }) => {
    await delay(100);

    const { symbol } = params;
    const stock = mockStocks.find(
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
