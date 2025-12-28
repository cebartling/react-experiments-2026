import type { FormId } from './form-coordination';

/**
 * Base error interface for all form-related errors
 */
export interface FormError {
  type: 'validation' | 'submission' | 'network' | 'unknown';
  message: string;
  timestamp: Date;
}

/**
 * Field-level validation error
 */
export interface FieldValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Form-level validation error summary
 */
export interface FormValidationError extends FormError {
  type: 'validation';
  formId: FormId;
  formName: string;
  fieldErrors: FieldValidationError[];
}

/**
 * Submission error for a single form
 */
export interface FormSubmissionError extends FormError {
  type: 'submission';
  formId: FormId;
  formName: string;
  statusCode?: number;
  retryable: boolean;
}

/**
 * Network-level error
 */
export interface NetworkError extends FormError {
  type: 'network';
  originalError?: Error;
  retryable: boolean;
}

/**
 * Aggregated error state for the entire form system
 */
export interface ErrorState {
  hasErrors: boolean;
  validationErrors: FormValidationError[];
  submissionErrors: FormSubmissionError[];
  networkError: NetworkError | null;
  lastErrorTimestamp: Date | null;
}

/**
 * Error severity levels for UI display
 */
export type ErrorSeverity = 'error' | 'warning' | 'info';

/**
 * Dismissible error notification
 */
export interface ErrorNotification {
  id: string;
  severity: ErrorSeverity;
  title: string;
  message: string;
  formId?: FormId;
  dismissible: boolean;
  autoDismiss?: number; // milliseconds
}
