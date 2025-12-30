import { flexRender, type HeaderGroup } from '@tanstack/react-table';
import type { Stock } from '../../types/stock';

/**
 * Props for the StickyHeader component.
 */
interface StickyHeaderProps {
  /** Header groups from TanStack Table */
  headerGroups: HeaderGroup<Stock>[];
}

/**
 * Sticky table header that remains fixed at the top during scroll.
 *
 * Supports sorting with keyboard navigation and accessibility features.
 *
 * @example
 * ```tsx
 * <StickyHeader headerGroups={table.getHeaderGroups()} />
 * ```
 */
export function StickyHeader({ headerGroups }: StickyHeaderProps) {
  return (
    <div className="sticky-header" role="rowgroup">
      {headerGroups.map((headerGroup) => (
        <div key={headerGroup.id} className="header-row" role="row">
          {headerGroup.headers.map((header) => {
            const canSort = header.column.getCanSort();
            const sortDirection = header.column.getIsSorted();

            return (
              <div
                key={header.id}
                className={`header-cell ${canSort ? 'sortable' : ''}`}
                style={{ width: header.getSize() }}
                onClick={header.column.getToggleSortingHandler()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    header.column.getToggleSortingHandler()?.(e);
                  }
                }}
                tabIndex={canSort ? 0 : undefined}
                role="columnheader"
                {...(sortDirection && {
                  'aria-sort': sortDirection === 'asc' ? 'ascending' : 'descending',
                })}
              >
                <span className="header-content">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                  {canSort && (
                    <span className="sort-indicator" aria-hidden="true">
                      {sortDirection === 'asc' && ' ↑'}
                      {sortDirection === 'desc' && ' ↓'}
                      {!sortDirection && ' ↕'}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
