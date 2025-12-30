import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { VirtualizedTableBody } from '../VirtualizedTableBody';
import { stockColumns } from '../columns';
import type { Stock } from '../../../types/stock';

// Mock TanStack Virtual
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: vi.fn(({ count, estimateSize }) => {
    const rowHeight = estimateSize ? estimateSize() : 48;
    return {
      getVirtualItems: () =>
        Array.from({ length: Math.min(count, 10) }, (_, i) => ({
          index: i,
          start: i * rowHeight,
          size: rowHeight,
          key: i,
        })),
      getTotalSize: () => count * rowHeight,
    };
  }),
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
];

function TestVirtualizedTable({ data }: { data: Stock[] }) {
  const table = useReactTable({
    data,
    columns: stockColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <VirtualizedTableBody rows={table.getRowModel().rows} />;
}

describe('VirtualizedTableBody', () => {
  it('should render stock rows', () => {
    render(<TestVirtualizedTable data={mockStocks} />);

    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('GOOGL')).toBeInTheDocument();
  });

  it('should render all stock data in rows', () => {
    render(<TestVirtualizedTable data={mockStocks} />);

    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('Alphabet Inc.')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('$140.00')).toBeInTheDocument();
  });

  it('should render no data message when rows are empty', () => {
    render(<TestVirtualizedTable data={[]} />);

    expect(screen.getByText('No stocks found')).toBeInTheDocument();
  });

  it('should apply tableHeight style to empty state container', () => {
    function TestWithCustomHeight() {
      const table = useReactTable({
        data: [],
        columns: stockColumns,
        getCoreRowModel: getCoreRowModel(),
      });
      return <VirtualizedTableBody rows={table.getRowModel().rows} tableHeight={500} />;
    }

    render(<TestWithCustomHeight />);

    const container = document.querySelector('.virtual-table-body');
    expect(container).toHaveStyle({ height: '500px' });
  });

  it('should have virtual-row class on rows', () => {
    render(<TestVirtualizedTable data={mockStocks} />);

    const rows = screen.getAllByRole('row');
    rows.forEach((row) => {
      expect(row).toHaveClass('virtual-row');
    });
  });

  it('should render rows with absolute positioning', () => {
    render(<TestVirtualizedTable data={mockStocks} />);

    const rows = screen.getAllByRole('row');
    rows.forEach((row) => {
      expect(row).toHaveStyle({ position: 'absolute' });
    });
  });

  it('should render cells with correct role', () => {
    render(<TestVirtualizedTable data={[mockStocks[0]]} />);

    const cells = screen.getAllByRole('cell');
    expect(cells).toHaveLength(7); // 7 columns
  });

  it('should render with custom row height', () => {
    const table = {
      data: mockStocks,
      columns: stockColumns,
      getCoreRowModel: getCoreRowModel(),
    };

    function TestWithRowHeight() {
      const t = useReactTable(table);
      return <VirtualizedTableBody rows={t.getRowModel().rows} rowHeight={60} />;
    }

    render(<TestWithRowHeight />);

    const rows = screen.getAllByRole('row');
    rows.forEach((row) => {
      expect(row).toHaveStyle({ height: '60px' }); // Validates custom rowHeight prop
    });
  });

  it('should render with custom table height', () => {
    function TestWithTableHeight() {
      const table = useReactTable({
        data: mockStocks,
        columns: stockColumns,
        getCoreRowModel: getCoreRowModel(),
      });
      return <VirtualizedTableBody rows={table.getRowModel().rows} tableHeight={400} />;
    }

    render(<TestWithTableHeight />);

    const container = document.querySelector('.virtual-table-body');
    expect(container).toHaveStyle({ height: '400px' });
  });

  it('should have rowgroup role on container', () => {
    render(<TestVirtualizedTable data={mockStocks} />);

    expect(screen.getByRole('rowgroup')).toBeInTheDocument();
  });
});
