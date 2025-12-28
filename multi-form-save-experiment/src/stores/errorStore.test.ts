import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useErrorStore } from './errorStore';
import type { FormValidationError, FormSubmissionError, NetworkError } from '../types/errors';

function resetStore() {
  useErrorStore.getState().clearAllErrors();
}

function createValidationError(
  formId: string,
  formName: string,
  fieldErrors: Array<{ field: string; message: string }>
): FormValidationError {
  return {
    type: 'validation',
    formId,
    formName,
    message: `${formName} has validation errors`,
    fieldErrors,
    timestamp: new Date(),
  };
}

function createSubmissionError(
  formId: string,
  formName: string,
  message: string = 'Submission failed'
): FormSubmissionError {
  return {
    type: 'submission',
    formId,
    formName,
    message,
    retryable: true,
    timestamp: new Date(),
  };
}

function createNetworkError(): NetworkError {
  return {
    type: 'network',
    message: 'Network error occurred',
    retryable: true,
    timestamp: new Date(),
  };
}

describe('errorStore', () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('setValidationErrors', () => {
    it('sets validation errors and updates hasErrors', () => {
      const { setValidationErrors } = useErrorStore.getState();
      const errors = [
        createValidationError('form-1', 'Form One', [{ field: 'name', message: 'Required' }]),
      ];

      setValidationErrors(errors);

      const state = useErrorStore.getState();
      expect(state.validationErrors).toHaveLength(1);
      expect(state.hasErrors).toBe(true);
      expect(state.lastErrorTimestamp).not.toBeNull();
    });

    it('sets hasErrors to false when empty array is passed and no other errors exist', () => {
      const { setValidationErrors } = useErrorStore.getState();
      const errors = [
        createValidationError('form-1', 'Form One', [{ field: 'name', message: 'Required' }]),
      ];

      setValidationErrors(errors);
      setValidationErrors([]);

      const state = useErrorStore.getState();
      expect(state.hasErrors).toBe(false);
    });

    it('keeps hasErrors true if submission errors exist', () => {
      const { setValidationErrors, setSubmissionErrors } = useErrorStore.getState();

      setSubmissionErrors([createSubmissionError('form-1', 'Form One')]);
      setValidationErrors([]);

      const state = useErrorStore.getState();
      expect(state.hasErrors).toBe(true);
    });
  });

  describe('clearValidationErrors', () => {
    it('removes all validation errors', () => {
      const { setValidationErrors, clearValidationErrors } = useErrorStore.getState();
      const errors = [
        createValidationError('form-1', 'Form One', [{ field: 'name', message: 'Required' }]),
      ];

      setValidationErrors(errors);
      clearValidationErrors();

      const state = useErrorStore.getState();
      expect(state.validationErrors).toHaveLength(0);
    });
  });

  describe('clearValidationErrorsForForm', () => {
    it('removes only errors for the specified form', () => {
      const { setValidationErrors, clearValidationErrorsForForm } = useErrorStore.getState();
      const errors = [
        createValidationError('form-1', 'Form One', [{ field: 'name', message: 'Required' }]),
        createValidationError('form-2', 'Form Two', [{ field: 'email', message: 'Invalid' }]),
      ];

      setValidationErrors(errors);
      clearValidationErrorsForForm('form-1');

      const state = useErrorStore.getState();
      expect(state.validationErrors).toHaveLength(1);
      expect(state.validationErrors[0].formId).toBe('form-2');
    });
  });

  describe('setSubmissionErrors', () => {
    it('sets submission errors and updates hasErrors', () => {
      const { setSubmissionErrors } = useErrorStore.getState();
      const errors = [createSubmissionError('form-1', 'Form One')];

      setSubmissionErrors(errors);

      const state = useErrorStore.getState();
      expect(state.submissionErrors).toHaveLength(1);
      expect(state.hasErrors).toBe(true);
    });
  });

  describe('addSubmissionError', () => {
    it('appends a submission error to existing errors', () => {
      const { setSubmissionErrors, addSubmissionError } = useErrorStore.getState();

      setSubmissionErrors([createSubmissionError('form-1', 'Form One')]);
      addSubmissionError(createSubmissionError('form-2', 'Form Two'));

      const state = useErrorStore.getState();
      expect(state.submissionErrors).toHaveLength(2);
    });
  });

  describe('clearSubmissionErrors', () => {
    it('removes all submission errors', () => {
      const { setSubmissionErrors, clearSubmissionErrors } = useErrorStore.getState();

      setSubmissionErrors([createSubmissionError('form-1', 'Form One')]);
      clearSubmissionErrors();

      const state = useErrorStore.getState();
      expect(state.submissionErrors).toHaveLength(0);
    });
  });

  describe('clearSubmissionErrorForForm', () => {
    it('removes only errors for the specified form', () => {
      const { setSubmissionErrors, clearSubmissionErrorForForm } = useErrorStore.getState();
      const errors = [
        createSubmissionError('form-1', 'Form One'),
        createSubmissionError('form-2', 'Form Two'),
      ];

      setSubmissionErrors(errors);
      clearSubmissionErrorForForm('form-1');

      const state = useErrorStore.getState();
      expect(state.submissionErrors).toHaveLength(1);
      expect(state.submissionErrors[0].formId).toBe('form-2');
    });
  });

  describe('setNetworkError', () => {
    it('sets network error and updates hasErrors', () => {
      const { setNetworkError } = useErrorStore.getState();

      setNetworkError(createNetworkError());

      const state = useErrorStore.getState();
      expect(state.networkError).not.toBeNull();
      expect(state.hasErrors).toBe(true);
    });

    it('clears network error when null is passed', () => {
      const { setNetworkError } = useErrorStore.getState();

      setNetworkError(createNetworkError());
      setNetworkError(null);

      const state = useErrorStore.getState();
      expect(state.networkError).toBeNull();
    });
  });

  describe('clearNetworkError', () => {
    it('removes the network error', () => {
      const { setNetworkError, clearNetworkError } = useErrorStore.getState();

      setNetworkError(createNetworkError());
      clearNetworkError();

      const state = useErrorStore.getState();
      expect(state.networkError).toBeNull();
    });

    it('keeps hasErrors true if other errors exist', () => {
      const { setNetworkError, setValidationErrors, clearNetworkError } = useErrorStore.getState();

      setNetworkError(createNetworkError());
      setValidationErrors([
        createValidationError('form-1', 'Form One', [{ field: 'name', message: 'Required' }]),
      ]);
      clearNetworkError();

      const state = useErrorStore.getState();
      expect(state.hasErrors).toBe(true);
    });
  });

  describe('hasErrors computed state', () => {
    it('is true when only validation errors exist', () => {
      const { setValidationErrors } = useErrorStore.getState();

      setValidationErrors([
        createValidationError('form-1', 'Form One', [{ field: 'name', message: 'Required' }]),
      ]);

      expect(useErrorStore.getState().hasErrors).toBe(true);
    });

    it('is true when only submission errors exist', () => {
      const { setSubmissionErrors } = useErrorStore.getState();

      setSubmissionErrors([createSubmissionError('form-1', 'Form One')]);

      expect(useErrorStore.getState().hasErrors).toBe(true);
    });

    it('is true when only network error exists', () => {
      const { setNetworkError } = useErrorStore.getState();

      setNetworkError(createNetworkError());

      expect(useErrorStore.getState().hasErrors).toBe(true);
    });

    it('is false when all errors are cleared', () => {
      const { setValidationErrors, setSubmissionErrors, setNetworkError, clearAllErrors } =
        useErrorStore.getState();

      setValidationErrors([
        createValidationError('form-1', 'Form One', [{ field: 'name', message: 'Required' }]),
      ]);
      setSubmissionErrors([createSubmissionError('form-1', 'Form One')]);
      setNetworkError(createNetworkError());
      clearAllErrors();

      expect(useErrorStore.getState().hasErrors).toBe(false);
    });
  });

  describe('addNotification', () => {
    it('adds notification with generated id', () => {
      const { addNotification } = useErrorStore.getState();

      const id = addNotification({
        severity: 'error',
        title: 'Error',
        message: 'Something went wrong',
        dismissible: true,
      });

      const state = useErrorStore.getState();
      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0].id).toBe(id);
      expect(state.notifications[0].title).toBe('Error');
    });

    it('auto-dismisses notification after specified time', () => {
      const { addNotification } = useErrorStore.getState();

      addNotification({
        severity: 'info',
        title: 'Success',
        message: 'Saved successfully',
        dismissible: true,
        autoDismiss: 3000,
      });

      expect(useErrorStore.getState().notifications).toHaveLength(1);

      vi.advanceTimersByTime(3000);

      expect(useErrorStore.getState().notifications).toHaveLength(0);
    });
  });

  describe('dismissNotification', () => {
    it('removes the specified notification', () => {
      const { addNotification, dismissNotification } = useErrorStore.getState();

      const id = addNotification({
        severity: 'error',
        title: 'Error',
        message: 'Something went wrong',
        dismissible: true,
      });

      dismissNotification(id);

      const state = useErrorStore.getState();
      expect(state.notifications).toHaveLength(0);
    });

    it('does not throw when notification does not exist', () => {
      const { dismissNotification } = useErrorStore.getState();

      expect(() => dismissNotification('nonexistent')).not.toThrow();
    });
  });

  describe('clearAllNotifications', () => {
    it('removes all notifications', () => {
      const { addNotification, clearAllNotifications } = useErrorStore.getState();

      addNotification({
        severity: 'error',
        title: 'Error 1',
        message: 'Message 1',
        dismissible: true,
      });
      addNotification({
        severity: 'error',
        title: 'Error 2',
        message: 'Message 2',
        dismissible: true,
      });

      clearAllNotifications();

      const state = useErrorStore.getState();
      expect(state.notifications).toHaveLength(0);
    });
  });

  describe('clearAllErrors', () => {
    it('clears all error types and notifications', () => {
      const {
        setValidationErrors,
        setSubmissionErrors,
        setNetworkError,
        addNotification,
        clearAllErrors,
      } = useErrorStore.getState();

      setValidationErrors([
        createValidationError('form-1', 'Form One', [{ field: 'name', message: 'Required' }]),
      ]);
      setSubmissionErrors([createSubmissionError('form-1', 'Form One')]);
      setNetworkError(createNetworkError());
      addNotification({ severity: 'error', title: 'Error', message: 'Message', dismissible: true });

      clearAllErrors();

      const state = useErrorStore.getState();
      expect(state.hasErrors).toBe(false);
      expect(state.validationErrors).toHaveLength(0);
      expect(state.submissionErrors).toHaveLength(0);
      expect(state.networkError).toBeNull();
      expect(state.notifications).toHaveLength(0);
    });
  });
});
