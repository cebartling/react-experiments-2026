import { flexRender, type Row } from '@tanstack/react-table';
import type { Stock } from '../../types/stock';

interface TableBodyProps {
  rows: Row<Stock>[];
}

export function TableBody({ rows }: TableBodyProps) {
  if (rows.length === 0) {
    return (
      <tbody className="stock-table-body">
        <tr>
          <td colSpan={100} className="no-data">
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
