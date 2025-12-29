import { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { flexRender, type Row } from '@tanstack/react-table';
import type { Stock } from '../../types/stock';

/**
 * Props for the VirtualizedTableBody component.
 */
interface VirtualizedTableBodyProps {
  /** Array of table rows to render */
  rows: Row<Stock>[];
  /** Height of each row in pixels. Defaults to 48. */
  rowHeight?: number;
  /** Number of rows to render outside visible area for smoother scrolling. Defaults to 10. */
  overscan?: number;
  /** Height of the table viewport in pixels. Defaults to 600. */
  tableHeight?: number;
}

/**
 * Virtualized table body that only renders visible rows.
 *
 * Uses TanStack Virtual to efficiently render large datasets by only
 * rendering rows that are visible in the viewport, plus an overscan buffer.
 *
 * @example
 * ```tsx
 * <VirtualizedTableBody
 *   rows={table.getRowModel().rows}
 *   rowHeight={48}
 *   overscan={10}
 *   tableHeight={600}
 * />
 * ```
 */
export function VirtualizedTableBody({
  rows,
  rowHeight = 48,
  overscan = 10,
  tableHeight = 600,
}: VirtualizedTableBodyProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => rowHeight, [rowHeight]),
    overscan,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalHeight = virtualizer.getTotalSize();

  if (rows.length === 0) {
    return (
      <div className="virtual-table-body" ref={parentRef}>
        <div className="no-data">No stocks found</div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="virtual-table-body"
      style={{ height: `${tableHeight}px`, overflow: 'auto' }}
      role="rowgroup"
    >
      <div
        style={{
          height: `${totalHeight}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow) => {
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
    </div>
  );
}
