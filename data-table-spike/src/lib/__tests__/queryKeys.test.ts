import { describe, it, expect } from 'vitest';
import { queryKeys } from '../queryKeys';

describe('queryKeys', () => {
  describe('stocks', () => {
    it('should have correct "all" key', () => {
      expect(queryKeys.stocks.all).toEqual(['stocks']);
    });

    it('should have correct "listBase" key', () => {
      expect(queryKeys.stocks.listBase()).toEqual(['stocks', 'list']);
    });

    it('should have correct "list" key without filters', () => {
      expect(queryKeys.stocks.list()).toEqual(['stocks', 'list', undefined]);
    });

    it('should have correct "list" key with filters', () => {
      const filters = { search: 'AAPL', sort: 'price' };
      expect(queryKeys.stocks.list(filters)).toEqual(['stocks', 'list', filters]);
    });

    it('should have correct "detailBase" key', () => {
      expect(queryKeys.stocks.detailBase()).toEqual(['stocks', 'detail']);
    });

    it('should have correct "detail" key for symbol', () => {
      expect(queryKeys.stocks.detail('AAPL')).toEqual(['stocks', 'detail', 'AAPL']);
    });

    it('should create unique keys for different symbols', () => {
      expect(queryKeys.stocks.detail('AAPL')).not.toEqual(queryKeys.stocks.detail('GOOGL'));
    });

    it('should create unique keys for different filters', () => {
      const filters1 = { search: 'AAPL' };
      const filters2 = { search: 'GOOGL' };
      expect(queryKeys.stocks.list(filters1)).not.toEqual(queryKeys.stocks.list(filters2));
    });
  });

  describe('key hierarchy', () => {
    it('should have "all" as prefix for all stock keys', () => {
      const allKey = queryKeys.stocks.all;
      const listBaseKey = queryKeys.stocks.listBase();
      const detailBaseKey = queryKeys.stocks.detailBase();

      expect(listBaseKey.slice(0, allKey.length)).toEqual(allKey);
      expect(detailBaseKey.slice(0, allKey.length)).toEqual(allKey);
    });
  });
});
