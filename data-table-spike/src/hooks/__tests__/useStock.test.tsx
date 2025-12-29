import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useStock } from '../useStock';
import { createWrapper } from '../../test/queryTestUtils';
import type { Stock } from '../../types/stock';

const mockStock: Stock = {
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
};

vi.mock('../../api/stockApi', () => ({
  fetchStockBySymbol: vi.fn(),
}));

import { fetchStockBySymbol } from '../../api/stockApi';

const mockedFetchStockBySymbol = vi.mocked(fetchStockBySymbol);

describe('useStock', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetAllMocks();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should return loading state initially', () => {
    mockedFetchStockBySymbol.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useStock('AAPL'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should return data when fetch succeeds', async () => {
    mockedFetchStockBySymbol.mockResolvedValue(mockStock);

    const { result } = renderHook(() => useStock('AAPL'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockStock);
    expect(result.current.error).toBeNull();
  });

  it('should return error when fetch fails', async () => {
    const error = new Error('Stock not found');
    mockedFetchStockBySymbol.mockRejectedValue(error);

    const { result } = renderHook(() => useStock('INVALID'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(error);
  });

  it('should call fetchStockBySymbol with symbol', async () => {
    mockedFetchStockBySymbol.mockResolvedValue(mockStock);

    renderHook(() => useStock('AAPL'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockedFetchStockBySymbol).toHaveBeenCalledWith('AAPL');
    });
  });

  it('should not fetch when enabled is false', async () => {
    mockedFetchStockBySymbol.mockResolvedValue(mockStock);

    const { result } = renderHook(() => useStock('AAPL', { enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedFetchStockBySymbol).not.toHaveBeenCalled();
  });

  it('should not fetch when symbol is empty', async () => {
    mockedFetchStockBySymbol.mockResolvedValue(mockStock);

    const { result } = renderHook(() => useStock(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedFetchStockBySymbol).not.toHaveBeenCalled();
  });
});
