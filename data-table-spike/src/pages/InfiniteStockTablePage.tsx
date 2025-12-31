import { Link } from 'react-router-dom';
import { InfiniteStockTable } from '../components/StockTable';
import './InfiniteStockTablePage.css';

/**
 * Page component for displaying the infinite scroll stock table.
 *
 * This page showcases paginated infinite scrolling using:
 * - TanStack Query infinite queries for data fetching
 * - TanStack Virtual for virtualized rendering
 * - Server-side sorting and filtering
 */
export function InfiniteStockTablePage() {
  return (
    <div className="infinite-stock-table-page">
      <header className="page-header">
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
        <h1>Stock Table - Infinite Scroll</h1>
        <p className="page-description">
          Paginated infinite scroll displaying 1,500+ stocks. Data is fetched in pages as you
          scroll, with virtualized rendering for optimal performance.
        </p>
      </header>

      <main className="page-content">
        <InfiniteStockTable />
      </main>
    </div>
  );
}
