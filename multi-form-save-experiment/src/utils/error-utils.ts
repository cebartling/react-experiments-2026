import type {
  FormValidationError,
  FormSubmissionError,
  NetworkError,
  FieldValidationError,
} from '../types/errors';
import type { FormId, FormValidationSummary, SubmitResult } from '../types/form-coordination';

/**
 * Converts validation summary to FormValidationError
 */
export function toValidationError(summary: FormValidationSummary): FormValidationError {
  return {
    type: 'validation',
    formId: summary.formId,
    formName: summary.formName,
    message: `${summary.formName} has validation errors`,
    fieldErrors: summary.errors.map((e) => ({
      field: e.field,
      message: e.message,
    })),
    timestamp: new Date(),
  };
}

/**
 * Converts failed submit result to FormSubmissionError
 */
export function toSubmissionError(result: SubmitResult, formName: string): FormSubmissionError {
  return {
    type: 'submission',
    formId: result.formId,
    formName,
    message: result.error ?? 'Submission failed',
    retryable: true,
    timestamp: new Date(),
  };
}

/**
 * Creates a network error from a caught exception
 */
export function createNetworkError(error: unknown): NetworkError {
  const originalError = error instanceof Error ? error : new Error(String(error));

  return {
    type: 'network',
    message: 'Network error occurred. Please check your connection.',
    originalError,
    retryable: true,
    timestamp: new Date(),
  };
}

/**
 * Formats field errors for display
 */
export function formatFieldErrors(errors: FieldValidationError[]): string {
  return errors.map((e) => `${e.field}: ${e.message}`).join('; ');
}

/**
 * Groups errors by form for summary display
 */
export function groupErrorsByForm(
  validationErrors: FormValidationError[],
  submissionErrors: FormSubmissionError[]
): Map<FormId, { validation: FieldValidationError[]; submission: string | null }> {
  const grouped = new Map<
    FormId,
    { validation: FieldValidationError[]; submission: string | null }
  >();

  for (const error of validationErrors) {
    const existing = grouped.get(error.formId) ?? { validation: [], submission: null };
    existing.validation = error.fieldErrors;
    grouped.set(error.formId, existing);
  }

  for (const error of submissionErrors) {
    const existing = grouped.get(error.formId) ?? { validation: [], submission: null };
    existing.submission = error.message;
    grouped.set(error.formId, existing);
  }

  return grouped;
}

/**
 * Determines if an error is retryable
 */
export function isRetryableError(error: FormSubmissionError | NetworkError): boolean {
  if (error.type === 'network') {
    return error.retryable;
  }

  // Check for specific non-retryable status codes
  if (error.statusCode) {
    const nonRetryable = [400, 401, 403, 404, 422];
    return !nonRetryable.includes(error.statusCode);
  }

  return error.retryable;
}

/**
 * Gets user-friendly error message
 */
export function getErrorMessage(
  error: FormValidationError | FormSubmissionError | NetworkError
): string {
  switch (error.type) {
    case 'validation':
      return `Please fix the errors in ${error.formName}`;
    case 'submission':
      return `Failed to save ${error.formName}: ${error.message}`;
    case 'network':
      return error.message;
    default:
      return 'An unexpected error occurred';
  }
}
