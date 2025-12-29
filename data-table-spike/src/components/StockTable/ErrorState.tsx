/**
 * Props for the ErrorState component.
 */
interface ErrorStateProps {
  /** The error object containing the message to display */
  error: Error;
  /** Optional callback invoked when the user clicks the retry button. If not provided, the retry button is not rendered. */
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <div className="error-icon" aria-hidden="true">
        ⚠
      </div>
      <h3 className="error-title">Failed to load stock data</h3>
      <p className="error-message">{error.message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="retry-button">
          Try Again
        </button>
      )}
    </div>
  );
}
