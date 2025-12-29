export class StockApiError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'StockApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static fromResponse(response: Response, body?: unknown): StockApiError {
    const errorBody = body as
      | { code?: string; message?: string; details?: Record<string, unknown> }
      | undefined;
    return new StockApiError(
      errorBody?.message || response.statusText || 'Unknown error',
      response.status,
      errorBody?.code,
      errorBody?.details
    );
  }

  get isNetworkError(): boolean {
    return this.statusCode === 0;
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  get isRateLimited(): boolean {
    return this.statusCode === 429;
  }
}
