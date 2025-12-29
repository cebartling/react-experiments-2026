import { flexRender, type Row } from '@tanstack/react-table';
import type { Stock } from '../../types/stock';

/**
 * Props for the TableBody component.
 */
interface TableBodyProps {
  /** Array of TanStack Table row objects to render */
  rows: Row<Stock>[];
  /** Number of columns for the empty state colSpan. Defaults to 7. */
  columnCount?: number;
}

/**
 * Renders the table body with stock data rows or an empty state message.
 */
export function TableBody({ rows, columnCount = 7 }: TableBodyProps) {
  if (rows.length === 0) {
    return (
      <tbody className="stock-table-body">
        <tr>
          <td colSpan={columnCount} className="no-data">
            No stocks found
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="stock-table-body">
      {rows.map((row) => (
        <tr key={row.id} className="stock-row">
          {row.getVisibleCells().map((cell) => (
            <td key={cell.id} style={{ width: cell.column.getSize() }}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
