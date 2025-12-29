import { createColumnHelper } from '@tanstack/react-table';
import type { Stock } from '../../types/stock';

const columnHelper = createColumnHelper<Stock>();

/**
 * Formats a number as currency
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/**
 * Formats a number with thousand separators
 */
function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Formats market cap in abbreviated form (B, M, K)
 */
function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return formatCurrency(value);
}

/**
 * Stock table column definitions
 */
export const stockColumns = [
  columnHelper.accessor('symbol', {
    header: 'Symbol',
    cell: (info) => <span className="stock-symbol">{info.getValue()}</span>,
    enableSorting: true,
    size: 100,
  }),
  columnHelper.accessor('companyName', {
    header: 'Company',
    cell: (info) => (
      <span className="company-name" title={info.getValue()}>
        {info.getValue()}
      </span>
    ),
    enableSorting: true,
    size: 200,
  }),
  columnHelper.accessor('price', {
    header: 'Price',
    cell: (info) => <span className="price">{formatCurrency(info.getValue())}</span>,
    enableSorting: true,
    size: 100,
  }),
  columnHelper.accessor('change', {
    header: 'Change',
    cell: (info) => {
      const value = info.getValue();
      const className = value >= 0 ? 'change positive' : 'change negative';
      const prefix = value >= 0 ? '+' : '';
      return (
        <span className={className}>
          {prefix}
          {formatCurrency(value)}
        </span>
      );
    },
    enableSorting: true,
    size: 100,
  }),
  columnHelper.accessor('changePercent', {
    header: 'Change %',
    cell: (info) => {
      const value = info.getValue();
      const className = value >= 0 ? 'change-percent positive' : 'change-percent negative';
      const prefix = value >= 0 ? '+' : '';
      return (
        <span className={className}>
          {prefix}
          {value.toFixed(2)}%
        </span>
      );
    },
    enableSorting: true,
    size: 100,
  }),
  columnHelper.accessor('volume', {
    header: 'Volume',
    cell: (info) => <span className="volume">{formatNumber(info.getValue())}</span>,
    enableSorting: true,
    size: 120,
  }),
  columnHelper.accessor('marketCap', {
    header: 'Market Cap',
    cell: (info) => <span className="market-cap">{formatMarketCap(info.getValue())}</span>,
    enableSorting: true,
    size: 120,
  }),
];
