import { describe, it, expect } from 'vitest';
import { StockApiError } from '../errors';

describe('StockApiError', () => {
  describe('constructor', () => {
    it('should create an error with message and status code', () => {
      const error = new StockApiError('Test error', 404);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('StockApiError');
    });

    it('should create an error with optional code and details', () => {
      const details = { field: 'symbol' };
      const error = new StockApiError('Validation error', 400, 'VALIDATION_ERROR', details);

      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual(details);
    });

    it('should be an instance of Error', () => {
      const error = new StockApiError('Test error', 500);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(StockApiError);
    });
  });

  describe('fromResponse', () => {
    it('should create error from response with JSON body', () => {
      const response = {
        status: 401,
        statusText: 'Unauthorized',
      } as Response;

      const body = {
        code: 'AUTH_ERROR',
        message: 'Invalid API key',
        details: { reason: 'expired' },
      };

      const error = StockApiError.fromResponse(response, body);

      expect(error.message).toBe('Invalid API key');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTH_ERROR');
      expect(error.details).toEqual({ reason: 'expired' });
    });

    it('should use statusText when body has no message', () => {
      const response = {
        status: 500,
        statusText: 'Internal Server Error',
      } as Response;

      const error = StockApiError.fromResponse(response);

      expect(error.message).toBe('Internal Server Error');
      expect(error.statusCode).toBe(500);
    });

    it('should use "Unknown error" when no message is available', () => {
      const response = {
        status: 500,
        statusText: '',
      } as Response;

      const error = StockApiError.fromResponse(response);

      expect(error.message).toBe('Unknown error');
    });
  });

  describe('isNetworkError', () => {
    it('should return true when status code is 0', () => {
      const error = new StockApiError('Network error', 0, 'NETWORK_ERROR');

      expect(error.isNetworkError).toBe(true);
    });

    it('should return false when status code is not 0', () => {
      const error = new StockApiError('Not found', 404);

      expect(error.isNetworkError).toBe(false);
    });
  });

  describe('isUnauthorized', () => {
    it('should return true when status code is 401', () => {
      const error = new StockApiError('Unauthorized', 401);

      expect(error.isUnauthorized).toBe(true);
    });

    it('should return false when status code is not 401', () => {
      const error = new StockApiError('Forbidden', 403);

      expect(error.isUnauthorized).toBe(false);
    });
  });

  describe('isRateLimited', () => {
    it('should return true when status code is 429', () => {
      const error = new StockApiError('Too many requests', 429);

      expect(error.isRateLimited).toBe(true);
    });

    it('should return false when status code is not 429', () => {
      const error = new StockApiError('Bad request', 400);

      expect(error.isRateLimited).toBe(false);
    });
  });
});
