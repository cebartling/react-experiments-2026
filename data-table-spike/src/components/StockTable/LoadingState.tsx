/**
 * Props for the LoadingState component.
 */
interface LoadingStateProps {
  /** Number of skeleton rows to display. Defaults to 10. */
  rowCount?: number;
  /** Number of skeleton columns to display. Defaults to 7 (matching the stock table columns). */
  columnCount?: number;
}

export function LoadingState({ rowCount = 10, columnCount = 7 }: LoadingStateProps) {
  return (
    <div className="loading-state" role="status" aria-label="Loading stock data">
      <table className="stock-table skeleton">
        <thead>
          <tr>
            {Array.from({ length: columnCount }).map((_, i) => (
              <th key={i}>
                <div className="skeleton-cell header" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <td key={colIndex}>
                  <div className="skeleton-cell" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
