import { Link } from 'react-router-dom';
import { StockTable } from '../components/StockTable';
import './StockTablePage.css';

/**
 * Page component for displaying the read-only stock table.
 *
 * This page showcases a basic data table implementation using:
 * - TanStack Table for table state management
 * - Client-side sorting and filtering
 * - All data loaded at once
 */
export function StockTablePage() {
  return (
    <div className="stock-table-page">
      <header className="page-header">
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
        <h1>Stock Table - Read Only</h1>
        <p className="page-description">
          Basic stock data table with client-side sorting and filtering. All data is loaded at
          once, making it suitable for smaller datasets.
        </p>
      </header>

      <main className="page-content">
        <StockTable />
      </main>
    </div>
  );
}
