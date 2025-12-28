import { useCallback } from 'react';
import { useErrorStore } from '../stores/errorStore';
import { toValidationError, toSubmissionError, createNetworkError } from '../utils/error-utils';
import type { FormId, FormValidationSummary, SubmitResult } from '../types/form-coordination';

interface UseErrorHandlingReturn {
  // State
  hasErrors: boolean;
  validationErrors: ReturnType<typeof useErrorStore.getState>['validationErrors'];
  submissionErrors: ReturnType<typeof useErrorStore.getState>['submissionErrors'];
  networkError: ReturnType<typeof useErrorStore.getState>['networkError'];
  notifications: ReturnType<typeof useErrorStore.getState>['notifications'];

  // Actions
  handleValidationFailures: (summaries: FormValidationSummary[]) => void;
  handleSubmissionFailures: (results: SubmitResult[], formNames: Map<FormId, string>) => void;
  handleNetworkError: (error: unknown) => void;
  clearErrorsForForm: (formId: FormId) => void;
  clearAllErrors: () => void;
  dismissNotification: (id: string) => void;
  showSuccessNotification: (message: string) => void;
  showErrorNotification: (title: string, message: string) => void;
}

/**
 * Hook for managing error state in form components
 */
export function useErrorHandling(): UseErrorHandlingReturn {
  const hasErrors = useErrorStore((state) => state.hasErrors);
  const validationErrors = useErrorStore((state) => state.validationErrors);
  const submissionErrors = useErrorStore((state) => state.submissionErrors);
  const networkError = useErrorStore((state) => state.networkError);
  const notifications = useErrorStore((state) => state.notifications);

  const setValidationErrors = useErrorStore((state) => state.setValidationErrors);
  const setSubmissionErrors = useErrorStore((state) => state.setSubmissionErrors);
  const setNetworkError = useErrorStore((state) => state.setNetworkError);
  const clearValidationErrorsForForm = useErrorStore((state) => state.clearValidationErrorsForForm);
  const clearSubmissionErrorForForm = useErrorStore((state) => state.clearSubmissionErrorForForm);
  const clearAllErrorsFn = useErrorStore((state) => state.clearAllErrors);
  const addNotification = useErrorStore((state) => state.addNotification);
  const dismissNotificationFn = useErrorStore((state) => state.dismissNotification);

  const handleValidationFailures = useCallback(
    (summaries: FormValidationSummary[]) => {
      const errors = summaries.map(toValidationError);
      setValidationErrors(errors);
    },
    [setValidationErrors]
  );

  const handleSubmissionFailures = useCallback(
    (results: SubmitResult[], formNames: Map<FormId, string>) => {
      const failedResults = results.filter((r) => !r.success);
      const errors = failedResults.map((r) =>
        toSubmissionError(r, formNames.get(r.formId) ?? r.formId)
      );
      setSubmissionErrors(errors);
    },
    [setSubmissionErrors]
  );

  const handleNetworkError = useCallback(
    (error: unknown) => {
      const networkErr = createNetworkError(error);
      setNetworkError(networkErr);
    },
    [setNetworkError]
  );

  const clearErrorsForForm = useCallback(
    (formId: FormId) => {
      clearValidationErrorsForForm(formId);
      clearSubmissionErrorForForm(formId);
    },
    [clearValidationErrorsForForm, clearSubmissionErrorForForm]
  );

  const showSuccessNotification = useCallback(
    (message: string) => {
      addNotification({
        severity: 'info',
        title: 'Success',
        message,
        dismissible: true,
        autoDismiss: 5000,
      });
    },
    [addNotification]
  );

  const showErrorNotification = useCallback(
    (title: string, message: string) => {
      addNotification({
        severity: 'error',
        title,
        message,
        dismissible: true,
      });
    },
    [addNotification]
  );

  return {
    hasErrors,
    validationErrors,
    submissionErrors,
    networkError,
    notifications,
    handleValidationFailures,
    handleSubmissionFailures,
    handleNetworkError,
    clearErrorsForForm,
    clearAllErrors: clearAllErrorsFn,
    dismissNotification: dismissNotificationFn,
    showSuccessNotification,
    showErrorNotification,
  };
}
