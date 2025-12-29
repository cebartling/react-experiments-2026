import { flexRender, type HeaderGroup } from '@tanstack/react-table';
import type { Stock } from '../../types/stock';

interface TableHeaderProps {
  headerGroups: HeaderGroup<Stock>[];
}

export function TableHeader({ headerGroups }: TableHeaderProps) {
  return (
    <thead className="stock-table-header">
      {headerGroups.map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const canSort = header.column.getCanSort();
            const sortDirection = header.column.getIsSorted();

            return (
              <th
                key={header.id}
                className={canSort ? 'sortable' : ''}
                style={{ width: header.getSize() }}
                onClick={header.column.getToggleSortingHandler()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    header.column.getToggleSortingHandler()?.(e);
                  }
                }}
                tabIndex={canSort ? 0 : undefined}
                role={canSort ? 'button' : undefined}
                aria-sort={
                  sortDirection === 'asc'
                    ? 'ascending'
                    : sortDirection === 'desc'
                      ? 'descending'
                      : undefined
                }
              >
                <span className="header-content">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                  {canSort && (
                    <span className="sort-indicator" aria-hidden="true">
                      {sortDirection === 'asc' && ' \u2191'}
                      {sortDirection === 'desc' && ' \u2193'}
                      {!sortDirection && ' \u2195'}
                    </span>
                  )}
                </span>
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
}
