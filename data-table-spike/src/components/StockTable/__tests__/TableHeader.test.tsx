import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { useState } from 'react';
import { TableHeader } from '../TableHeader';
import { stockColumns } from '../columns';
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
];

function TestTableWithHeader({ onSortingChange }: { onSortingChange?: () => void }) {
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);

  const table = useReactTable({
    data: mockStocks,
    columns: stockColumns,
    state: { sorting },
    onSortingChange: (updater) => {
      setSorting(typeof updater === 'function' ? updater(sorting) : updater);
      onSortingChange?.();
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <table>
      <TableHeader headerGroups={table.getHeaderGroups()} />
    </table>
  );
}

describe('TableHeader', () => {
  it('should render all column headers', () => {
    render(<TestTableWithHeader />);

    expect(screen.getByText('Symbol')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Change')).toBeInTheDocument();
    expect(screen.getByText('Change %')).toBeInTheDocument();
    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(screen.getByText('Market Cap')).toBeInTheDocument();
  });

  it('should have sortable class on sortable columns', () => {
    render(<TestTableWithHeader />);

    const symbolHeader = screen.getByText('Symbol').closest('th');
    expect(symbolHeader).toHaveClass('sortable');
  });

  it('should display sort indicator for unsorted columns', () => {
    render(<TestTableWithHeader />);

    const sortIndicators = screen.getAllByText('\u2195');
    expect(sortIndicators.length).toBeGreaterThan(0);
  });

  it('should toggle sorting on click', async () => {
    const user = userEvent.setup();
    const onSortingChange = vi.fn();

    render(<TestTableWithHeader onSortingChange={onSortingChange} />);

    const symbolHeader = screen.getByText('Symbol').closest('th');
    await user.click(symbolHeader!);

    expect(onSortingChange).toHaveBeenCalled();
  });

  it('should have button role on sortable columns', () => {
    render(<TestTableWithHeader />);

    const symbolHeader = screen.getByText('Symbol').closest('th');
    expect(symbolHeader).toHaveAttribute('role', 'button');
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    const onSortingChange = vi.fn();

    render(<TestTableWithHeader onSortingChange={onSortingChange} />);

    const symbolHeader = screen.getByText('Symbol').closest('th');
    symbolHeader?.focus();
    await user.keyboard('{Enter}');

    expect(onSortingChange).toHaveBeenCalled();
  });

  it('should have tabIndex on sortable columns', () => {
    render(<TestTableWithHeader />);

    const symbolHeader = screen.getByText('Symbol').closest('th');
    expect(symbolHeader).toHaveAttribute('tabIndex', '0');
  });

  it('should have aria-hidden on sort indicator', () => {
    render(<TestTableWithHeader />);

    const sortIndicator = screen.getAllByText('\u2195')[0];
    expect(sortIndicator.closest('.sort-indicator')).toHaveAttribute('aria-hidden', 'true');
  });
});
