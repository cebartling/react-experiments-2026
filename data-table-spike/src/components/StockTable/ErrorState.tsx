interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <div className="error-icon" aria-hidden="true">
        Warning
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
