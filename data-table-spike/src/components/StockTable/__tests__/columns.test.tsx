import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useReactTable, getCoreRowModel, flexRender, type Row } from '@tanstack/react-table';
import { stockColumns } from '../columns';
import type { Stock } from '../../../types/stock';

const mockStock: Stock = {
  symbol: 'AAPL',
  companyName: 'Apple Inc.',
  price: 150.25,
  change: 2.5,
  changePercent: 1.69,
  volume: 75000000,
  marketCap: 2400000000000,
  high52Week: 180.0,
  low52Week: 120.0,
  lastUpdated: '2024-01-15T16:00:00Z',
};

const negativeStock: Stock = {
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
};

function TestTable({ data }: { data: Stock[] }) {
  const table = useReactTable({
    data,
    columns: stockColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table>
      <tbody>
        {table.getRowModel().rows.map((row: Row<Stock>) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

describe('stockColumns', () => {
  it('should have all required columns', () => {
    const columnIds = stockColumns.map((col) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const column = col as any;
      return column.accessorKey || column.id;
    });

    expect(columnIds).toContain('symbol');
    expect(columnIds).toContain('companyName');
    expect(columnIds).toContain('price');
    expect(columnIds).toContain('change');
    expect(columnIds).toContain('changePercent');
    expect(columnIds).toContain('volume');
    expect(columnIds).toContain('marketCap');
  });

  it('should render symbol with stock-symbol class', () => {
    render(<TestTable data={[mockStock]} />);
    const symbolCell = screen.getByText('AAPL');
    expect(symbolCell).toHaveClass('stock-symbol');
  });

  it('should render company name with company-name class', () => {
    render(<TestTable data={[mockStock]} />);
    const companyCell = screen.getByText('Apple Inc.');
    expect(companyCell).toHaveClass('company-name');
    expect(companyCell).toHaveAttribute('title', 'Apple Inc.');
  });

  it('should format price as currency', () => {
    render(<TestTable data={[mockStock]} />);
    expect(screen.getByText('$150.25')).toBeInTheDocument();
  });

  it('should format positive change with + prefix and positive class', () => {
    render(<TestTable data={[mockStock]} />);
    const changeCell = screen.getByText('+$2.50');
    expect(changeCell).toHaveClass('positive');
  });

  it('should format negative change with negative class', () => {
    render(<TestTable data={[negativeStock]} />);
    const changeCell = screen.getByText('-$1.20');
    expect(changeCell).toHaveClass('negative');
  });

  it('should format positive change percent with + prefix and positive class', () => {
    render(<TestTable data={[mockStock]} />);
    const changePercentCell = screen.getByText('+1.69%');
    expect(changePercentCell).toHaveClass('positive');
  });

  it('should format negative change percent with negative class', () => {
    render(<TestTable data={[negativeStock]} />);
    const changePercentCell = screen.getByText('-0.85%');
    expect(changePercentCell).toHaveClass('negative');
  });

  it('should format volume with thousand separators', () => {
    render(<TestTable data={[mockStock]} />);
    expect(screen.getByText('75,000,000')).toBeInTheDocument();
  });

  it('should format market cap in trillions', () => {
    render(<TestTable data={[mockStock]} />);
    expect(screen.getByText('$2.40T')).toBeInTheDocument();
  });

  it('should format market cap in billions', () => {
    const smallCapStock = { ...mockStock, marketCap: 5000000000 };
    render(<TestTable data={[smallCapStock]} />);
    expect(screen.getByText('$5.00B')).toBeInTheDocument();
  });

  it('should format market cap in millions', () => {
    const microCapStock = { ...mockStock, marketCap: 500000000 };
    render(<TestTable data={[microCapStock]} />);
    expect(screen.getByText('$500.00M')).toBeInTheDocument();
  });

  it('should have sorting enabled for all columns', () => {
    stockColumns.forEach((column) => {
      if ('enableSorting' in column) {
        expect(column.enableSorting).toBe(true);
      }
    });
  });
});
