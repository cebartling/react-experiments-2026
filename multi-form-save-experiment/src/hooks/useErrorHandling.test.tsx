import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useErrorHandling } from './useErrorHandling';
import { useErrorStore } from '../stores/errorStore';
import type { FormValidationSummary, SubmitResult } from '../types/form-coordination';

function resetStore() {
  useErrorStore.getState().clearAllErrors();
}

describe('useErrorHandling', () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('state exposure', () => {
    it('returns hasErrors from store', () => {
      const { result } = renderHook(() => useErrorHandling());

      expect(result.current.hasErrors).toBe(false);

      act(() => {
        useErrorStore.getState().setValidationErrors([
          {
            type: 'validation',
            formId: 'form-1',
            formName: 'User Info',
            message: 'Errors',
            fieldErrors: [{ field: 'name', message: 'Required' }],
            timestamp: new Date(),
          },
        ]);
      });

      expect(result.current.hasErrors).toBe(true);
    });

    it('returns validationErrors from store', () => {
      const { result } = renderHook(() => useErrorHandling());

      expect(result.current.validationErrors).toHaveLength(0);

      act(() => {
        useErrorStore.getState().setValidationErrors([
          {
            type: 'validation',
            formId: 'form-1',
            formName: 'User Info',
            message: 'Errors',
            fieldErrors: [{ field: 'name', message: 'Required' }],
            timestamp: new Date(),
          },
        ]);
      });

      expect(result.current.validationErrors).toHaveLength(1);
    });

    it('returns submissionErrors from store', () => {
      const { result } = renderHook(() => useErrorHandling());

      expect(result.current.submissionErrors).toHaveLength(0);

      act(() => {
        useErrorStore.getState().setSubmissionErrors([
          {
            type: 'submission',
            formId: 'form-1',
            formName: 'User Info',
            message: 'Server error',
            retryable: true,
            timestamp: new Date(),
          },
        ]);
      });

      expect(result.current.submissionErrors).toHaveLength(1);
    });

    it('returns networkError from store', () => {
      const { result } = renderHook(() => useErrorHandling());

      expect(result.current.networkError).toBeNull();

      act(() => {
        useErrorStore.getState().setNetworkError({
          type: 'network',
          message: 'Network error',
          retryable: true,
          timestamp: new Date(),
        });
      });

      expect(result.current.networkError).not.toBeNull();
    });

    it('returns notifications from store', () => {
      const { result } = renderHook(() => useErrorHandling());

      expect(result.current.notifications).toHaveLength(0);

      act(() => {
        useErrorStore.getState().addNotification({
          severity: 'error',
          title: 'Error',
          message: 'Something went wrong',
          dismissible: true,
        });
      });

      expect(result.current.notifications).toHaveLength(1);
    });
  });

  describe('handleValidationFailures', () => {
    it('converts validation summaries to errors and stores them', () => {
      const { result } = renderHook(() => useErrorHandling());

      const summaries: FormValidationSummary[] = [
        {
          formId: 'form-1',
          formName: 'User Info',
          errors: [{ field: 'name', message: 'Name is required' }],
        },
      ];

      act(() => {
        result.current.handleValidationFailures(summaries);
      });

      expect(result.current.validationErrors).toHaveLength(1);
      expect(result.current.validationErrors[0].formId).toBe('form-1');
      expect(result.current.validationErrors[0].fieldErrors).toHaveLength(1);
    });

    it('handles multiple form validation failures', () => {
      const { result } = renderHook(() => useErrorHandling());

      const summaries: FormValidationSummary[] = [
        {
          formId: 'form-1',
          formName: 'User Info',
          errors: [{ field: 'name', message: 'Required' }],
        },
        {
          formId: 'form-2',
          formName: 'Address',
          errors: [{ field: 'street', message: 'Required' }],
        },
      ];

      act(() => {
        result.current.handleValidationFailures(summaries);
      });

      expect(result.current.validationErrors).toHaveLength(2);
    });
  });

  describe('handleSubmissionFailures', () => {
    it('converts failed submit results to errors and stores them', () => {
      const { result } = renderHook(() => useErrorHandling());

      const results: SubmitResult[] = [{ success: false, formId: 'form-1', error: 'Server error' }];
      const formNames = new Map([['form-1', 'User Info']]);

      act(() => {
        result.current.handleSubmissionFailures(results, formNames);
      });

      expect(result.current.submissionErrors).toHaveLength(1);
      expect(result.current.submissionErrors[0].formName).toBe('User Info');
      expect(result.current.submissionErrors[0].message).toBe('Server error');
    });

    it('filters out successful results', () => {
      const { result } = renderHook(() => useErrorHandling());

      const results: SubmitResult[] = [
        { success: true, formId: 'form-1' },
        { success: false, formId: 'form-2', error: 'Failed' },
      ];
      const formNames = new Map([
        ['form-1', 'User Info'],
        ['form-2', 'Address'],
      ]);

      act(() => {
        result.current.handleSubmissionFailures(results, formNames);
      });

      expect(result.current.submissionErrors).toHaveLength(1);
      expect(result.current.submissionErrors[0].formId).toBe('form-2');
    });

    it('uses formId as fallback when formName is not found', () => {
      const { result } = renderHook(() => useErrorHandling());

      const results: SubmitResult[] = [{ success: false, formId: 'unknown-form', error: 'Failed' }];
      const formNames = new Map<string, string>();

      act(() => {
        result.current.handleSubmissionFailures(results, formNames);
      });

      expect(result.current.submissionErrors[0].formName).toBe('unknown-form');
    });
  });

  describe('handleNetworkError', () => {
    it('creates and stores network error from Error instance', () => {
      const { result } = renderHook(() => useErrorHandling());

      act(() => {
        result.current.handleNetworkError(new Error('Network timeout'));
      });

      expect(result.current.networkError).not.toBeNull();
      expect(result.current.networkError?.type).toBe('network');
    });

    it('creates network error from string', () => {
      const { result } = renderHook(() => useErrorHandling());

      act(() => {
        result.current.handleNetworkError('Connection failed');
      });

      expect(result.current.networkError).not.toBeNull();
    });
  });

  describe('clearErrorsForForm', () => {
    it('clears both validation and submission errors for a specific form', () => {
      const { result } = renderHook(() => useErrorHandling());

      // Set up errors
      act(() => {
        useErrorStore.getState().setValidationErrors([
          {
            type: 'validation',
            formId: 'form-1',
            formName: 'User Info',
            message: 'Errors',
            fieldErrors: [{ field: 'name', message: 'Required' }],
            timestamp: new Date(),
          },
          {
            type: 'validation',
            formId: 'form-2',
            formName: 'Address',
            message: 'Errors',
            fieldErrors: [{ field: 'street', message: 'Required' }],
            timestamp: new Date(),
          },
        ]);
        useErrorStore.getState().setSubmissionErrors([
          {
            type: 'submission',
            formId: 'form-1',
            formName: 'User Info',
            message: 'Server error',
            retryable: true,
            timestamp: new Date(),
          },
        ]);
      });

      act(() => {
        result.current.clearErrorsForForm('form-1');
      });

      expect(result.current.validationErrors).toHaveLength(1);
      expect(result.current.validationErrors[0].formId).toBe('form-2');
      expect(result.current.submissionErrors).toHaveLength(0);
    });
  });

  describe('clearAllErrors', () => {
    it('clears all errors and notifications', () => {
      const { result } = renderHook(() => useErrorHandling());

      // Set up errors
      act(() => {
        useErrorStore.getState().setValidationErrors([
          {
            type: 'validation',
            formId: 'form-1',
            formName: 'User Info',
            message: 'Errors',
            fieldErrors: [],
            timestamp: new Date(),
          },
        ]);
        useErrorStore.getState().setSubmissionErrors([
          {
            type: 'submission',
            formId: 'form-1',
            formName: 'User Info',
            message: 'Server error',
            retryable: true,
            timestamp: new Date(),
          },
        ]);
        useErrorStore.getState().setNetworkError({
          type: 'network',
          message: 'Network error',
          retryable: true,
          timestamp: new Date(),
        });
      });

      act(() => {
        result.current.clearAllErrors();
      });

      expect(result.current.hasErrors).toBe(false);
      expect(result.current.validationErrors).toHaveLength(0);
      expect(result.current.submissionErrors).toHaveLength(0);
      expect(result.current.networkError).toBeNull();
    });
  });

  describe('dismissNotification', () => {
    it('removes the specified notification', () => {
      const { result } = renderHook(() => useErrorHandling());

      let notificationId: string;
      act(() => {
        notificationId = useErrorStore.getState().addNotification({
          severity: 'error',
          title: 'Error',
          message: 'Something went wrong',
          dismissible: true,
        });
      });

      expect(result.current.notifications).toHaveLength(1);

      act(() => {
        result.current.dismissNotification(notificationId);
      });

      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('showSuccessNotification', () => {
    it('adds an info notification with auto-dismiss', () => {
      const { result } = renderHook(() => useErrorHandling());

      act(() => {
        result.current.showSuccessNotification('Changes saved successfully');
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].severity).toBe('info');
      expect(result.current.notifications[0].title).toBe('Success');
      expect(result.current.notifications[0].message).toBe('Changes saved successfully');
      expect(result.current.notifications[0].autoDismiss).toBe(5000);
    });

    it('auto-dismisses after 5 seconds', () => {
      const { result } = renderHook(() => useErrorHandling());

      act(() => {
        result.current.showSuccessNotification('Changes saved');
      });

      expect(result.current.notifications).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('showErrorNotification', () => {
    it('adds an error notification without auto-dismiss', () => {
      const { result } = renderHook(() => useErrorHandling());

      act(() => {
        result.current.showErrorNotification('Save Failed', 'Unable to save changes');
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].severity).toBe('error');
      expect(result.current.notifications[0].title).toBe('Save Failed');
      expect(result.current.notifications[0].message).toBe('Unable to save changes');
      expect(result.current.notifications[0].autoDismiss).toBeUndefined();
    });
  });
});
