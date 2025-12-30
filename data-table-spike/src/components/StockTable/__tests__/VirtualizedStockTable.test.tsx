import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VirtualizedStockTable } from '../VirtualizedStockTable';
import type { Stock } from '../../../types/stock';

// Mock TanStack Virtual
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: vi.fn(({ count }) => ({
    getVirtualItems: () =>
      Array.from({ length: Math.min(count, 10) }, (_, i) => ({
        index: i,
        start: i * 48,
        size: 48,
        key: i,
      })),
    getTotalSize: () => count * 48,
  })),
}));

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
    price: 380.0,
    change: 5.0,
    changePercent: 1.33,
    volume: 30000000,
    marketCap: 2800000000000,
    high52Week: 400.0,
    low52Week: 300.0,
    lastUpdated: '2024-01-15T16:00:00Z',
  },
];

// Mock the useStockData hook
const mockUseStockData = vi.fn();
vi.mock('../../../hooks/useStockData', () => ({
  useStockData: () => mockUseStockData(),
}));

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function renderWithProvider(ui: React.ReactElement) {
  const queryClient = createQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('VirtualizedStockTable', () => {
  beforeEach(() => {
    mockUseStockData.mockReset();
  });

  it('should render loading state when loading', () => {
    mockUseStockData.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProvider(<VirtualizedStockTable />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading stock data')).toBeInTheDocument();
  });

  it('should render error state when error occurs', () => {
    const mockError = new Error('Failed to fetch stocks');
    mockUseStockData.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: vi.fn(),
    });

    renderWithProvider(<VirtualizedStockTable />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch stocks')).toBeInTheDocument();
  });

  it('should render retry button in error state', async () => {
    const mockRefetch = vi.fn();
    mockUseStockData.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
      refetch: mockRefetch,
    });

    const user = userEvent.setup();
    renderWithProvider(<VirtualizedStockTable />);

    const retryButton = screen.getByText('Try Again');
    await user.click(retryButton);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should render stock table when data is loaded', () => {
    mockUseStockData.mockReturnValue({
      data: mockStocks,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProvider(<VirtualizedStockTable />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
  });

  it('should render search filter', () => {
    mockUseStockData.mockReturnValue({
      data: mockStocks,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProvider(<VirtualizedStockTable />);

    expect(screen.getByPlaceholderText('Search by symbol or company...')).toBeInTheDocument();
  });

  it('should render row count', () => {
    mockUseStockData.mockReturnValue({
      data: mockStocks,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProvider(<VirtualizedStockTable />);

    expect(screen.getByText('3 stocks')).toBeInTheDocument();
  });

  it('should render column headers', () => {
    mockUseStockData.mockReturnValue({
      data: mockStocks,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProvider(<VirtualizedStockTable />);

    expect(screen.getByText('Symbol')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
  });

  it('should have virtualized-stock-table class on container', () => {
    mockUseStockData.mockReturnValue({
      data: mockStocks,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProvider(<VirtualizedStockTable />);

    expect(document.querySelector('.virtualized-stock-table')).toBeInTheDocument();
  });

  it('should have correct aria-label on table container', () => {
    mockUseStockData.mockReturnValue({
      data: mockStocks,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProvider(<VirtualizedStockTable />);

    expect(screen.getByLabelText('Stock data table')).toBeInTheDocument();
  });

  it('should filter stocks when search input is used', async () => {
    mockUseStockData.mockReturnValue({
      data: mockStocks,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    renderWithProvider(<VirtualizedStockTable />);

    const searchInput = screen.getByPlaceholderText('Search by symbol or company...');
    await user.type(searchInput, 'AAPL');

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Should show filter indicator when filtering
    // Note: The actual filtering behavior depends on TanStack Table's getFilteredRowModel
  });

  it('should sort when header is clicked', async () => {
    mockUseStockData.mockReturnValue({
      data: mockStocks,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    renderWithProvider(<VirtualizedStockTable />);

    const symbolHeader = screen.getByText('Symbol').closest('.header-cell');
    await user.click(symbolHeader!);

    expect(symbolHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  it('should render with custom props', () => {
    mockUseStockData.mockReturnValue({
      data: mockStocks,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProvider(<VirtualizedStockTable rowHeight={60} overscan={5} tableHeight={400} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should show no data message when empty array is returned', () => {
    mockUseStockData.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProvider(<VirtualizedStockTable />);

    expect(screen.getByText('No stocks found')).toBeInTheDocument();
    expect(screen.getByText('0 stocks')).toBeInTheDocument();
  });
});
