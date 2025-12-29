import { useState, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
} from '@tanstack/react-table';
import { useStockData } from '../../hooks';
import { stockColumns } from './columns';
import { SearchFilter } from './SearchFilter';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import './StockTable.css';

export function StockTable() {
  const { data: stocks, isLoading, error, refetch } = useStockData();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data: stocks ?? [],
    columns: stockColumns,
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

  return (
    <div className="stock-table-container">
      <div className="stock-table-toolbar">
        <SearchFilter
          value={globalFilter}
          onChange={setGlobalFilter}
          placeholder="Search by symbol or company..."
        />
        <div className="stock-count">
          {table.getFilteredRowModel().rows.length}{' '}
          {table.getFilteredRowModel().rows.length === 1 ? 'stock' : 'stocks'}
        </div>
      </div>
      <div className="stock-table-wrapper">
        <table className="stock-table">
          <TableHeader headerGroups={table.getHeaderGroups()} />
          <TableBody rows={table.getRowModel().rows} />
        </table>
      </div>
    </div>
  );
}
