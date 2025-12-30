import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { useState } from 'react';
import { StickyHeader } from '../StickyHeader';
import { stockColumns } from '../columns';
import type { Stock } from '../../../types/stock';
import type { SortingState } from '@tanstack/react-table';

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
];

function TestStickyHeader({ enableSorting = true }: { enableSorting?: boolean }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: mockStocks,
    columns: stockColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting,
  });

  return <StickyHeader headerGroups={table.getHeaderGroups()} />;
}

describe('StickyHeader', () => {
  it('should render all column headers', () => {
    render(<TestStickyHeader />);

    expect(screen.getByText('Symbol')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Change')).toBeInTheDocument();
    expect(screen.getByText('Change %')).toBeInTheDocument();
    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(screen.getByText('Market Cap')).toBeInTheDocument();
  });

  it('should have sticky-header class on container', () => {
    render(<TestStickyHeader />);

    const header = document.querySelector('.sticky-header');
    expect(header).toBeInTheDocument();
  });

  it('should have sortable class on sortable columns', () => {
    render(<TestStickyHeader />);

    const headerCells = document.querySelectorAll('.header-cell.sortable');
    expect(headerCells.length).toBeGreaterThan(0);
  });

  it('should render sort indicators on sortable columns', () => {
    render(<TestStickyHeader />);

    const sortIndicators = document.querySelectorAll('.sort-indicator');
    expect(sortIndicators.length).toBeGreaterThan(0);
  });

  it('should have correct ARIA role on header row', () => {
    render(<TestStickyHeader />);

    expect(screen.getByRole('row')).toBeInTheDocument();
  });

  it('should have columnheader role on header cells', () => {
    render(<TestStickyHeader />);

    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders.length).toBe(7); // 7 columns
  });

  it('should toggle sorting when header is clicked', async () => {
    const user = userEvent.setup();
    render(<TestStickyHeader />);

    const symbolHeader = screen.getByText('Symbol').closest('.header-cell');
    expect(symbolHeader).toBeInTheDocument();

    await user.click(symbolHeader!);

    // After first click, should show ascending indicator
    expect(symbolHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  it('should support keyboard navigation for sorting', async () => {
    render(<TestStickyHeader />);

    const symbolHeader = screen.getByText('Symbol').closest('.header-cell') as HTMLElement;
    expect(symbolHeader).toBeInTheDocument();

    symbolHeader.focus();
    fireEvent.keyDown(symbolHeader, { key: 'Enter' });

    expect(symbolHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  it('should support space key for sorting', async () => {
    render(<TestStickyHeader />);

    const symbolHeader = screen.getByText('Symbol').closest('.header-cell') as HTMLElement;
    expect(symbolHeader).toBeInTheDocument();

    symbolHeader.focus();
    fireEvent.keyDown(symbolHeader, { key: ' ' });

    expect(symbolHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  it('should have tabIndex on sortable columns', () => {
    render(<TestStickyHeader />);

    const sortableHeaders = document.querySelectorAll('.header-cell.sortable');
    sortableHeaders.forEach((header) => {
      expect(header).toHaveAttribute('tabIndex', '0');
    });
  });

  it('should have rowgroup role on container', () => {
    render(<TestStickyHeader />);

    expect(screen.getByRole('rowgroup')).toBeInTheDocument();
  });

  it('should cycle through sort states: none -> asc -> desc', async () => {
    const user = userEvent.setup();
    render(<TestStickyHeader />);

    const symbolHeader = screen.getByText('Symbol').closest('.header-cell');

    // Initial state - no sort
    expect(symbolHeader).not.toHaveAttribute('aria-sort');

    // First click - ascending
    await user.click(symbolHeader!);
    expect(symbolHeader).toHaveAttribute('aria-sort', 'ascending');

    // Second click - descending
    await user.click(symbolHeader!);
    expect(symbolHeader).toHaveAttribute('aria-sort', 'descending');
  });
});
