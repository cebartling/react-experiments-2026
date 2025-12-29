import { describe, it, expect } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { createQueryClient, queryClient } from '../queryClient';

describe('queryClient', () => {
  describe('createQueryClient', () => {
    it('should create a QueryClient instance', () => {
      const client = createQueryClient();
      expect(client).toBeInstanceOf(QueryClient);
    });

    it('should create independent instances', () => {
      const client1 = createQueryClient();
      const client2 = createQueryClient();
      expect(client1).not.toBe(client2);
    });

    it('should have default query options', () => {
      const client = createQueryClient();
      const defaultOptions = client.getDefaultOptions();

      expect(defaultOptions.queries?.staleTime).toBe(30 * 1000);
      expect(defaultOptions.queries?.gcTime).toBe(5 * 60 * 1000);
      expect(defaultOptions.queries?.retry).toBe(3);
      expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(true);
      expect(defaultOptions.queries?.refetchOnMount).toBe(true);
    });

    it('should have default mutation options', () => {
      const client = createQueryClient();
      const defaultOptions = client.getDefaultOptions();

      expect(defaultOptions.mutations?.retry).toBe(1);
    });

    it('should have exponential backoff for retries', () => {
      const client = createQueryClient();
      const defaultOptions = client.getDefaultOptions();
      const retryDelay = defaultOptions.queries?.retryDelay as (attemptIndex: number) => number;

      expect(retryDelay(0)).toBe(1000);
      expect(retryDelay(1)).toBe(2000);
      expect(retryDelay(2)).toBe(4000);
      expect(retryDelay(5)).toBe(30000); // Capped at 30s
    });
  });

  describe('singleton queryClient', () => {
    it('should export a singleton QueryClient instance', () => {
      expect(queryClient).toBeInstanceOf(QueryClient);
    });
  });
});
