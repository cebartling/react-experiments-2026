import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StockTable } from '../StockTable';
import type { Stock } from '../../../types/stock';

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
  {
    symbol: 'MSFT',
    companyName: 'Microsoft Corporation',
    price: 350.0,
    change: 5.0,
    changePercent: 1.45,
    volume: 30000000,
    marketCap: 2600000000000,
    high52Week: 400.0,
    low52Week: 280.0,
    lastUpdated: '2024-01-15T16:00:00Z',
  },
];

vi.mock('../../../hooks/useStockData', () => ({
  useStockData: vi.fn(),
}));

import { useStockData } from '../../../hooks/useStockData';

const mockedUseStockData = vi.mocked(useStockData);

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('StockTable', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Loading state', () => {
    it('should render loading state when data is loading', () => {
      mockedUseStockData.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<StockTable />);

      expect(screen.getByRole('status', { name: 'Loading stock data' })).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('should render error state when there is an error', () => {
      mockedUseStockData.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
        refetch: vi.fn(),
      });

      renderWithProviders(<StockTable />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('should call refetch when retry button is clicked', async () => {
      const refetch = vi.fn();
      mockedUseStockData.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
        refetch,
      });

      const user = userEvent.setup();
      renderWithProviders(<StockTable />);

      await user.click(screen.getByRole('button', { name: 'Try Again' }));

      expect(refetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Data display', () => {
    it('should render table with stock data', () => {
      mockedUseStockData.mockReturnValue({
        data: mockStocks,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<StockTable />);

      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('GOOGL')).toBeInTheDocument();
      expect(screen.getByText('MSFT')).toBeInTheDocument();
    });

    it('should display stock count', () => {
      mockedUseStockData.mockReturnValue({
        data: mockStocks,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<StockTable />);

      expect(screen.getByText('3 stocks')).toBeInTheDocument();
    });

    it('should render all column headers', () => {
      mockedUseStockData.mockReturnValue({
        data: mockStocks,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<StockTable />);

      expect(screen.getByText('Symbol')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('Change')).toBeInTheDocument();
      expect(screen.getByText('Change %')).toBeInTheDocument();
      expect(screen.getByText('Volume')).toBeInTheDocument();
      expect(screen.getByText('Market Cap')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should filter stocks by search input', async () => {
      vi.useFakeTimers();
      mockedUseStockData.mockReturnValue({
        data: mockStocks,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<StockTable />);

      const searchInput = screen.getByPlaceholderText('Search by symbol or company...');

      fireEvent.change(searchInput, { target: { value: 'Apple' } });

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.queryByText('GOOGL')).not.toBeInTheDocument();
      expect(screen.queryByText('MSFT')).not.toBeInTheDocument();

      vi.useRealTimers();
    });

    it('should update stock count when filtering', async () => {
      vi.useFakeTimers();
      mockedUseStockData.mockReturnValue({
        data: mockStocks,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<StockTable />);

      expect(screen.getByText('3 stocks')).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText('Search by symbol or company...');

      fireEvent.change(searchInput, { target: { value: 'Apple' } });

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText('1 stocks')).toBeInTheDocument();

      vi.useRealTimers();
    });

    it('should show no stocks found when filter has no matches', async () => {
      vi.useFakeTimers();
      mockedUseStockData.mockReturnValue({
        data: mockStocks,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<StockTable />);

      const searchInput = screen.getByPlaceholderText('Search by symbol or company...');

      fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } });

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText('No stocks found')).toBeInTheDocument();
      expect(screen.getByText('0 stocks')).toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  describe('Sorting', () => {
    it('should sort stocks when column header is clicked', async () => {
      mockedUseStockData.mockReturnValue({
        data: mockStocks,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      const user = userEvent.setup();
      renderWithProviders(<StockTable />);

      const symbolHeader = screen.getByText('Symbol').closest('th');
      await user.click(symbolHeader!);

      const rows = screen.getAllByRole('row').slice(1); // Skip header row
      const firstSymbol = rows[0].querySelector('.stock-symbol');
      expect(firstSymbol).toHaveTextContent('AAPL');
    });
  });

  describe('Empty state', () => {
    it('should render no stocks found when data is empty', () => {
      mockedUseStockData.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

      renderWithProviders(<StockTable />);

      expect(screen.getByText('No stocks found')).toBeInTheDocument();
      expect(screen.getByText('0 stocks')).toBeInTheDocument();
    });
  });
});
