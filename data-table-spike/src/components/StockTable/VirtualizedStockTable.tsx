import { useState, useCallback, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
} from '@tanstack/react-table';
import { useStockData } from '../../hooks/useStockData';
import { stockColumns } from './columns';
import { SearchFilter } from './SearchFilter';
import { StickyHeader } from './StickyHeader';
import { VirtualizedTableBody } from './VirtualizedTableBody';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import './VirtualizedStockTable.css';

/**
 * Props for the VirtualizedStockTable component.
 */
interface VirtualizedStockTableProps {
  /** Height of each row in pixels. Defaults to 48. */
  rowHeight?: number;
  /** Number of rows to render outside visible area for smoother scrolling. Defaults to 10. */
  overscan?: number;
  /** Height of the table viewport in pixels. Defaults to 600. */
  tableHeight?: number;
}

/**
 * Virtualized stock table for handling large datasets efficiently.
 *
 * Combines TanStack Table for data management with TanStack Virtual for
 * virtualization, ensuring smooth scrolling and optimal performance when
 * displaying thousands of rows.
 *
 * Features:
 * - Virtualized rendering (only visible rows are rendered)
 * - Sticky header that stays visible during scroll
 * - Sortable columns
 * - Global search filter
 * - Configurable row height and viewport size
 *
 * @example
 * ```tsx
 * <VirtualizedStockTable
 *   rowHeight={48}
 *   overscan={10}
 *   tableHeight={600}
 * />
 * ```
 */
export function VirtualizedStockTable({
  rowHeight = 48,
  overscan = 10,
  tableHeight = 600,
}: VirtualizedStockTableProps) {
  const { data: stocks, isLoading, error, refetch } = useStockData();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo(() => stockColumns, []);

  const table = useReactTable({
    data: stocks ?? [],
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableSorting: true,
    enableFilters: true,
  });

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  const rows = table.getRowModel().rows;

  return (
    <div className="virtualized-stock-table">
      <div className="table-toolbar">
        <SearchFilter
          value={globalFilter}
          onChange={setGlobalFilter}
          placeholder="Search by symbol or company..."
        />
        <div className="table-info">
          <span className="row-count">{rows.length.toLocaleString()} stocks</span>
          {globalFilter && (
            <span className="filter-indicator">
              (filtered from {stocks?.length.toLocaleString()})
            </span>
          )}
        </div>
      </div>

      <div
        className="table-container"
        role="table"
        aria-label="Stock data table"
        aria-rowcount={rows.length + 1}
      >
        <StickyHeader headerGroups={table.getHeaderGroups()} />
        <VirtualizedTableBody
          rows={rows}
          rowHeight={rowHeight}
          overscan={overscan}
          tableHeight={tableHeight}
        />
      </div>
    </div>
  );
}
