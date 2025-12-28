import { describe, it, expect } from 'vitest';
import {
  toValidationError,
  toSubmissionError,
  createNetworkError,
  formatFieldErrors,
  groupErrorsByForm,
  isRetryableError,
  getErrorMessage,
} from './error-utils';
import type { FormValidationSummary, SubmitResult } from '../types/form-coordination';
import type {
  FormValidationError,
  FormSubmissionError,
  NetworkError,
  FieldValidationError,
} from '../types/errors';

describe('error-utils', () => {
  describe('toValidationError', () => {
    it('converts FormValidationSummary to FormValidationError', () => {
      const summary: FormValidationSummary = {
        formId: 'form-1',
        formName: 'User Info',
        errors: [
          { field: 'name', message: 'Name is required' },
          { field: 'email', message: 'Invalid email format' },
        ],
      };

      const result = toValidationError(summary);

      expect(result.type).toBe('validation');
      expect(result.formId).toBe('form-1');
      expect(result.formName).toBe('User Info');
      expect(result.message).toBe('User Info has validation errors');
      expect(result.fieldErrors).toHaveLength(2);
      expect(result.fieldErrors[0]).toEqual({ field: 'name', message: 'Name is required' });
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('toSubmissionError', () => {
    it('converts failed SubmitResult to FormSubmissionError', () => {
      const submitResult: SubmitResult = {
        success: false,
        formId: 'form-1',
        error: 'Server error: 500',
      };

      const result = toSubmissionError(submitResult, 'User Info');

      expect(result.type).toBe('submission');
      expect(result.formId).toBe('form-1');
      expect(result.formName).toBe('User Info');
      expect(result.message).toBe('Server error: 500');
      expect(result.retryable).toBe(true);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('uses default message when error is undefined', () => {
      const submitResult: SubmitResult = {
        success: false,
        formId: 'form-1',
      };

      const result = toSubmissionError(submitResult, 'User Info');

      expect(result.message).toBe('Submission failed');
    });
  });

  describe('createNetworkError', () => {
    it('creates NetworkError from Error instance', () => {
      const originalError = new Error('Network timeout');

      const result = createNetworkError(originalError);

      expect(result.type).toBe('network');
      expect(result.message).toBe('Network error occurred. Please check your connection.');
      expect(result.originalError).toBe(originalError);
      expect(result.retryable).toBe(true);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('creates NetworkError from string', () => {
      const result = createNetworkError('Something went wrong');

      expect(result.type).toBe('network');
      expect(result.originalError?.message).toBe('Something went wrong');
    });

    it('creates NetworkError from unknown type', () => {
      const result = createNetworkError({ code: 'ERR_NETWORK' });

      expect(result.type).toBe('network');
      expect(result.originalError?.message).toBe('[object Object]');
    });
  });

  describe('formatFieldErrors', () => {
    it('formats field errors as semicolon-separated string', () => {
      const errors: FieldValidationError[] = [
        { field: 'name', message: 'Required' },
        { field: 'email', message: 'Invalid format' },
      ];

      const result = formatFieldErrors(errors);

      expect(result).toBe('name: Required; email: Invalid format');
    });

    it('returns empty string for empty array', () => {
      const result = formatFieldErrors([]);

      expect(result).toBe('');
    });
  });

  describe('groupErrorsByForm', () => {
    it('groups validation and submission errors by form', () => {
      const validationErrors: FormValidationError[] = [
        {
          type: 'validation',
          formId: 'form-1',
          formName: 'User Info',
          message: 'Errors',
          fieldErrors: [{ field: 'name', message: 'Required' }],
          timestamp: new Date(),
        },
      ];

      const submissionErrors: FormSubmissionError[] = [
        {
          type: 'submission',
          formId: 'form-2',
          formName: 'Address',
          message: 'Server error',
          retryable: true,
          timestamp: new Date(),
        },
      ];

      const result = groupErrorsByForm(validationErrors, submissionErrors);

      expect(result.size).toBe(2);
      expect(result.get('form-1')?.validation).toHaveLength(1);
      expect(result.get('form-1')?.submission).toBeNull();
      expect(result.get('form-2')?.validation).toHaveLength(0);
      expect(result.get('form-2')?.submission).toBe('Server error');
    });

    it('combines errors for the same form', () => {
      const validationErrors: FormValidationError[] = [
        {
          type: 'validation',
          formId: 'form-1',
          formName: 'User Info',
          message: 'Errors',
          fieldErrors: [{ field: 'name', message: 'Required' }],
          timestamp: new Date(),
        },
      ];

      const submissionErrors: FormSubmissionError[] = [
        {
          type: 'submission',
          formId: 'form-1',
          formName: 'User Info',
          message: 'Server error',
          retryable: true,
          timestamp: new Date(),
        },
      ];

      const result = groupErrorsByForm(validationErrors, submissionErrors);

      expect(result.size).toBe(1);
      expect(result.get('form-1')?.validation).toHaveLength(1);
      expect(result.get('form-1')?.submission).toBe('Server error');
    });
  });

  describe('isRetryableError', () => {
    it('returns true for retryable network error', () => {
      const error: NetworkError = {
        type: 'network',
        message: 'Network error',
        retryable: true,
        timestamp: new Date(),
      };

      expect(isRetryableError(error)).toBe(true);
    });

    it('returns false for non-retryable network error', () => {
      const error: NetworkError = {
        type: 'network',
        message: 'Network error',
        retryable: false,
        timestamp: new Date(),
      };

      expect(isRetryableError(error)).toBe(false);
    });

    it('returns false for 400 status code submission error', () => {
      const error: FormSubmissionError = {
        type: 'submission',
        formId: 'form-1',
        formName: 'User Info',
        message: 'Bad request',
        statusCode: 400,
        retryable: true,
        timestamp: new Date(),
      };

      expect(isRetryableError(error)).toBe(false);
    });

    it('returns false for 401 status code submission error', () => {
      const error: FormSubmissionError = {
        type: 'submission',
        formId: 'form-1',
        formName: 'User Info',
        message: 'Unauthorized',
        statusCode: 401,
        retryable: true,
        timestamp: new Date(),
      };

      expect(isRetryableError(error)).toBe(false);
    });

    it('returns false for 403 status code submission error', () => {
      const error: FormSubmissionError = {
        type: 'submission',
        formId: 'form-1',
        formName: 'User Info',
        message: 'Forbidden',
        statusCode: 403,
        retryable: true,
        timestamp: new Date(),
      };

      expect(isRetryableError(error)).toBe(false);
    });

    it('returns false for 404 status code submission error', () => {
      const error: FormSubmissionError = {
        type: 'submission',
        formId: 'form-1',
        formName: 'User Info',
        message: 'Not found',
        statusCode: 404,
        retryable: true,
        timestamp: new Date(),
      };

      expect(isRetryableError(error)).toBe(false);
    });

    it('returns false for 422 status code submission error', () => {
      const error: FormSubmissionError = {
        type: 'submission',
        formId: 'form-1',
        formName: 'User Info',
        message: 'Unprocessable entity',
        statusCode: 422,
        retryable: true,
        timestamp: new Date(),
      };

      expect(isRetryableError(error)).toBe(false);
    });

    it('returns true for 500 status code submission error', () => {
      const error: FormSubmissionError = {
        type: 'submission',
        formId: 'form-1',
        formName: 'User Info',
        message: 'Internal server error',
        statusCode: 500,
        retryable: true,
        timestamp: new Date(),
      };

      expect(isRetryableError(error)).toBe(true);
    });

    it('returns retryable flag value when no status code', () => {
      const error: FormSubmissionError = {
        type: 'submission',
        formId: 'form-1',
        formName: 'User Info',
        message: 'Error',
        retryable: false,
        timestamp: new Date(),
      };

      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('returns validation error message', () => {
      const error: FormValidationError = {
        type: 'validation',
        formId: 'form-1',
        formName: 'User Info',
        message: 'Has errors',
        fieldErrors: [],
        timestamp: new Date(),
      };

      expect(getErrorMessage(error)).toBe('Please fix the errors in User Info');
    });

    it('returns submission error message', () => {
      const error: FormSubmissionError = {
        type: 'submission',
        formId: 'form-1',
        formName: 'User Info',
        message: 'Server timeout',
        retryable: true,
        timestamp: new Date(),
      };

      expect(getErrorMessage(error)).toBe('Failed to save User Info: Server timeout');
    });

    it('returns network error message', () => {
      const error: NetworkError = {
        type: 'network',
        message: 'Connection failed',
        retryable: true,
        timestamp: new Date(),
      };

      expect(getErrorMessage(error)).toBe('Connection failed');
    });
  });
});
