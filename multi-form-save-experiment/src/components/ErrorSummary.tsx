import type { FormValidationError, FormSubmissionError } from '../types/errors';

interface ErrorSummaryProps {
  validationErrors: FormValidationError[];
  submissionErrors: FormSubmissionError[];
  onDismiss?: () => void;
}

export function ErrorSummary({ validationErrors, submissionErrors, onDismiss }: ErrorSummaryProps) {
  const hasValidation = validationErrors.length > 0;
  const hasSubmission = submissionErrors.length > 0;

  if (!hasValidation && !hasSubmission) {
    return null;
  }

  return (
    <div
      className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm sm:mb-8"
      role="alert"
      aria-labelledby="error-summary-title"
      data-testid="error-summary"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 rounded-full bg-red-100 p-2">
          <svg
            className="h-5 w-5 text-red-600"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3
            id="error-summary-title"
            className="text-sm font-semibold tracking-tight text-red-800"
          >
            Please fix the following errors before saving:
          </h3>

          {hasValidation && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-red-700">Validation Errors</h4>
              <ul className="mt-2 space-y-2">
                {validationErrors.map((error) => (
                  <li key={error.formId} className="text-sm text-red-700">
                    <span className="font-semibold">{error.formName}:</span>
                    <ul className="ml-4 mt-1 list-inside list-disc space-y-1">
                      {error.fieldErrors.map((fieldError, idx) => (
                        <li key={idx} className="text-red-600">
                          {fieldError.message}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasSubmission && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-red-700">Submission Errors</h4>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-600">
                {submissionErrors.map((error) => (
                  <li key={error.formId}>
                    <span className="font-semibold text-red-700">{error.formName}:</span>{' '}
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {onDismiss && (
          <div className="ml-auto flex-shrink-0 pl-3">
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Dismiss errors"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
