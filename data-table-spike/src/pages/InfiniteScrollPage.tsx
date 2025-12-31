import { Link } from 'react-router-dom';
import { InfiniteStockTable } from '../components/StockTable';
import './InfiniteScrollPage.css';

/**
 * Page component for demonstrating infinite scroll with large datasets.
 *
 * This page showcases efficient handling of large datasets using:
 * - Infinite scroll pagination (loads data as user scrolls)
 * - Virtual rendering (only visible rows are rendered in the DOM)
 * - Server-side filtering and sorting
 *
 * Optimized settings for large datasets:
 * - Page size of 100 items for fewer network requests
 * - Higher overscan for smoother scrolling
 * - Larger viewport for better data visibility
 */
export function InfiniteScrollPage() {
  return (
    <div className="infinite-scroll-page">
      <header className="page-header">
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
        <h1>Infinite Scroll - Large Dataset</h1>
        <p className="page-description">
          Efficiently displaying 1,500+ stocks with virtual rendering and paginated data fetching.
          Scroll down to automatically load more data.
        </p>
      </header>

      <main className="page-content">
        <InfiniteStockTable pageSize={100} overscan={15} tableHeight={700} rowHeight={48} />
      </main>

      <footer className="page-footer">
        <div className="performance-tips">
          <h3>Performance Optimizations</h3>
          <ul>
            <li>
              <strong>Virtual Rendering:</strong> Only visible rows are rendered in the DOM
            </li>
            <li>
              <strong>Infinite Scroll:</strong> Data loads automatically as you scroll
            </li>
            <li>
              <strong>Server-side Processing:</strong> Filtering and sorting happen on the server
            </li>
            <li>
              <strong>Debounced Search:</strong> Reduces API calls during typing
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
