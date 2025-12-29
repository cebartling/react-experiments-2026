import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { axe } from 'vitest-axe';
import { vi } from 'vitest';
import App from './App';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function renderWithProviders(initialRoute = '/') {
  const queryClient = createTestQueryClient();
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

vi.mock('./hooks/useStockData', () => ({
  useStockData: vi.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isPending: false,
    isSuccess: true,
    status: 'success',
    fetchStatus: 'idle',
  })),
}));

describe('App', () => {
  describe('Home page', () => {
    it('renders the heading', () => {
      renderWithProviders('/');

      expect(screen.getByRole('heading', { name: /data table spike/i })).toBeInTheDocument();
    });

    it('renders navigation link to stocks page', () => {
      renderWithProviders('/');

      const stocksLink = screen.getByRole('link', { name: /stock table/i });
      expect(stocksLink).toHaveAttribute('href', '/stocks-read-only');
    });

    it('has no accessibility violations on home page', async () => {
      const { container } = renderWithProviders('/');

      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });
  });

  describe('Navigation', () => {
    it('navigates to stocks page when link is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders('/');

      const stocksLink = screen.getByRole('link', { name: /stock table/i });
      await user.click(stocksLink);

      expect(screen.getByText(/0 stocks/i)).toBeInTheDocument();
    });
  });

  describe('Stocks page', () => {
    it('renders stock table on /stocks-read-only route', () => {
      renderWithProviders('/stocks-read-only');

      expect(screen.getByText(/0 stocks/i)).toBeInTheDocument();
    });
  });
});
