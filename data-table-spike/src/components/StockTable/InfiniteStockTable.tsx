import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  type SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useInfiniteStockData, flattenStockPages, getTotalCount } from '../../hooks/useInfiniteStockData';
import { stockColumns } from './columns';
import { SearchFilter } from './SearchFilter';
import { StickyHeader } from './StickyHeader';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { flexRender } from '@tanstack/react-table';
import type { Stock } from '../../types/stock';
import './VirtualizedStockTable.css';

/**
 * Props for the InfiniteStockTable component.
 */
interface InfiniteStockTableProps {
  /** Height of each row in pixels. Defaults to 48. */
  rowHeight?: number;
  /** Number of rows to render outside visible area for smoother scrolling. Defaults to 10. */
  overscan?: number;
  /** Height of the table viewport in pixels. Defaults to 600. */
  tableHeight?: number;
  /** Number of items per page. Defaults to 50. */
  pageSize?: number;
}

/**
 * Stock table with infinite scrolling and virtualization.
 *
 * Combines TanStack Table, TanStack Virtual, and TanStack Query's infinite queries
 * to efficiently display and load large datasets. Data is fetched in pages as the
 * user scrolls, while virtualization ensures only visible rows are rendered.
 *
 * Features:
 * - Infinite scroll pagination (loads more data as you scroll)
 * - Virtualized rendering (only visible rows are rendered)
 * - Server-side search filtering
 * - Sortable columns
 * - Sticky header
 * - Loading indicators for initial load and pagination
 *
 * @example
 * ```tsx
 * <InfiniteStockTable
 *   rowHeight={48}
 *   overscan={10}
 *   tableHeight={600}
 *   pageSize={50}
 * />
 * ```
 */
export function InfiniteStockTable({
  rowHeight = 48,
  overscan = 10,
  tableHeight = 600,
  pageSize = 50,
}: InfiniteStockTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const parentRef = useRef<HTMLDivElement>(null);

  // Debounce search to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(globalFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [globalFilter]);

  // Get sort configuration from table state
  const sortConfig = useMemo(() => {
    if (sorting.length === 0) return {};
    const sort = sorting[0];
    return {
      sortBy: sort.id as keyof Stock,
      sortOrder: sort.desc ? 'desc' : 'asc',
    } as const;
  }, [sorting]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteStockData({
    pageSize,
    search: debouncedSearch,
    ...sortConfig,
  });

  const pages = data?.pages;
  const stocks = useMemo(() => flattenStockPages(pages), [pages]);
  const totalCount = useMemo(() => getTotalCount(pages), [pages]);

  const columns = useMemo(() => stockColumns, []);

  const table = useReactTable({
    data: stocks,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true, // Server-side sorting
    enableSorting: true,
  });

  const rows = table.getRowModel().rows;

  // Virtualizer for efficient rendering
  const virtualizer = useVirtualizer({
    count: hasNextPage ? rows.length + 1 : rows.length, // Add 1 for loading row
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => rowHeight, [rowHeight]),
    overscan,
  });

  const virtualRows = virtualizer.getVirtualItems();

  // Fetch next page when scrolling near the bottom
  useEffect(() => {
    const lastItem = virtualRows[virtualRows.length - 1];
    if (!lastItem) return;

    // Trigger fetch when we're within 5 items of the end
    if (
      lastItem.index >= rows.length - 5 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [virtualRows, rows.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  const totalHeight = virtualizer.getTotalSize();

  return (
    <div className="virtualized-stock-table">
      <div className="table-toolbar">
        <SearchFilter
          value={globalFilter}
          onChange={setGlobalFilter}
          placeholder="Search by symbol or company..."
        />
        <div className="table-info">
          <span className="row-count">
            {stocks.length.toLocaleString()} of {totalCount.toLocaleString()} stocks
          </span>
          {isFetchingNextPage && (
            <span className="loading-indicator">Loading more...</span>
          )}
        </div>
      </div>

      <div
        className="table-container"
        role="table"
        aria-label="Stock data table"
        aria-rowcount={totalCount + 1}
      >
        <StickyHeader headerGroups={table.getHeaderGroups()} />

        <div
          ref={parentRef}
          className="virtual-table-body"
          style={{ height: `${tableHeight}px`, overflow: 'auto' }}
          role="rowgroup"
        >
          {rows.length === 0 ? (
            <div className="no-data">
              {debouncedSearch ? 'No stocks match your search' : 'No stocks found'}
            </div>
          ) : (
            <div
              style={{
                height: `${totalHeight}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualRows.map((virtualRow) => {
                const isLoaderRow = virtualRow.index >= rows.length;

                if (isLoaderRow) {
                  return (
                    <div
                      key="loader"
                      className="virtual-row loading-row"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {hasNextPage ? (
                        <span className="loading-text">Loading more stocks...</span>
                      ) : null}
                    </div>
                  );
                }

                const row = rows[virtualRow.index];

                return (
                  <div
                    key={row.id}
                    className="virtual-row"
                    role="row"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className="virtual-row-content">
                      {row.getVisibleCells().map((cell) => (
                        <div
                          key={cell.id}
                          className="virtual-cell"
                          role="cell"
                          style={{ width: cell.column.getSize() }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      {totalCount > 0 && (
        <div className="pagination-progress">
          <div
            className="progress-bar"
            style={{ width: `${(stocks.length / totalCount) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
