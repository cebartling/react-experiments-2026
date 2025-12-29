export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_STOCK_API_URL || 'https://api.example.com/v1',
  apiKey: import.meta.env.VITE_STOCK_API_KEY || '',
  timeout: Number(import.meta.env.VITE_STOCK_API_TIMEOUT) || 10000,
} as const;
