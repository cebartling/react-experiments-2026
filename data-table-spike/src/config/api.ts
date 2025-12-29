const DEFAULT_TIMEOUT = 10000;

function parseTimeout(value: string | undefined): number {
  if (!value) {
    return DEFAULT_TIMEOUT;
  }
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_TIMEOUT;
  }
  return parsed;
}

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_STOCK_API_URL || 'https://api.example.com/v1',
  apiKey: import.meta.env.VITE_STOCK_API_KEY || '',
  timeout: parseTimeout(import.meta.env.VITE_STOCK_API_TIMEOUT),
} as const;
