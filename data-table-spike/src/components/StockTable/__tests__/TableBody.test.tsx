import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { TableBody } from '../TableBody';
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

function TestTableWithBody({ data }: { data: Stock[] }) {
  const table = useReactTable({
    data,
    columns: stockColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table>
      <TableBody rows={table.getRowModel().rows} />
    </table>
  );
}

describe('TableBody', () => {
  it('should render stock rows', () => {
    render(<TestTableWithBody data={mockStocks} />);

    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('GOOGL')).toBeInTheDocument();
  });

  it('should render all stock data in rows', () => {
    render(<TestTableWithBody data={mockStocks} />);

    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('Alphabet Inc.')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('$140.00')).toBeInTheDocument();
  });

  it('should render no data message when rows are empty', () => {
    render(<TestTableWithBody data={[]} />);

    expect(screen.getByText('No stocks found')).toBeInTheDocument();
  });

  it('should have stock-row class on rows', () => {
    render(<TestTableWithBody data={mockStocks} />);

    const rows = screen.getAllByRole('row');
    rows.forEach((row) => {
      expect(row).toHaveClass('stock-row');
    });
  });

  it('should render correct number of rows', () => {
    render(<TestTableWithBody data={mockStocks} />);

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(2);
  });

  it('should render correct number of cells per row', () => {
    render(<TestTableWithBody data={[mockStocks[0]]} />);

    const cells = screen.getAllByRole('cell');
    expect(cells).toHaveLength(7); // 7 columns
  });
});
