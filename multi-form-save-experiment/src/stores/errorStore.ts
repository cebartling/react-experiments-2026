import { create } from 'zustand';
import type {
  ErrorState,
  FormValidationError,
  FormSubmissionError,
  NetworkError,
  ErrorNotification,
} from '../types/errors';
import type { FormId } from '../types/form-coordination';

interface ErrorStoreState extends ErrorState {
  // Notifications
  notifications: ErrorNotification[];

  // Actions for validation errors
  setValidationErrors: (errors: FormValidationError[]) => void;
  clearValidationErrors: () => void;
  clearValidationErrorsForForm: (formId: FormId) => void;

  // Actions for submission errors
  setSubmissionErrors: (errors: FormSubmissionError[]) => void;
  addSubmissionError: (error: FormSubmissionError) => void;
  clearSubmissionErrors: () => void;
  clearSubmissionErrorForForm: (formId: FormId) => void;

  // Actions for network errors
  setNetworkError: (error: NetworkError | null) => void;
  clearNetworkError: () => void;

  // Notification actions
  addNotification: (notification: Omit<ErrorNotification, 'id'>) => string;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;

  // Global actions
  clearAllErrors: () => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useErrorStore = create<ErrorStoreState>((set, get) => ({
  // Initial state
  hasErrors: false,
  validationErrors: [],
  submissionErrors: [],
  networkError: null,
  lastErrorTimestamp: null,
  notifications: [],

  // Validation error actions
  setValidationErrors: (errors) => {
    set({
      validationErrors: errors,
      hasErrors:
        errors.length > 0 || get().submissionErrors.length > 0 || get().networkError !== null,
      lastErrorTimestamp: errors.length > 0 ? new Date() : get().lastErrorTimestamp,
    });
  },

  clearValidationErrors: () => {
    set((state) => ({
      validationErrors: [],
      hasErrors: state.submissionErrors.length > 0 || state.networkError !== null,
    }));
  },

  clearValidationErrorsForForm: (formId) => {
    set((state) => {
      const filtered = state.validationErrors.filter((e) => e.formId !== formId);
      return {
        validationErrors: filtered,
        hasErrors:
          filtered.length > 0 || state.submissionErrors.length > 0 || state.networkError !== null,
      };
    });
  },

  // Submission error actions
  setSubmissionErrors: (errors) => {
    set({
      submissionErrors: errors,
      hasErrors:
        errors.length > 0 || get().validationErrors.length > 0 || get().networkError !== null,
      lastErrorTimestamp: errors.length > 0 ? new Date() : get().lastErrorTimestamp,
    });
  },

  addSubmissionError: (error) => {
    set((state) => ({
      submissionErrors: [...state.submissionErrors, error],
      hasErrors: true,
      lastErrorTimestamp: new Date(),
    }));
  },

  clearSubmissionErrors: () => {
    set((state) => ({
      submissionErrors: [],
      hasErrors: state.validationErrors.length > 0 || state.networkError !== null,
    }));
  },

  clearSubmissionErrorForForm: (formId) => {
    set((state) => {
      const filtered = state.submissionErrors.filter((e) => e.formId !== formId);
      return {
        submissionErrors: filtered,
        hasErrors:
          filtered.length > 0 || state.validationErrors.length > 0 || state.networkError !== null,
      };
    });
  },

  // Network error actions
  setNetworkError: (error) => {
    set({
      networkError: error,
      hasErrors:
        error !== null || get().validationErrors.length > 0 || get().submissionErrors.length > 0,
      lastErrorTimestamp: error ? new Date() : get().lastErrorTimestamp,
    });
  },

  clearNetworkError: () => {
    set((state) => ({
      networkError: null,
      hasErrors: state.validationErrors.length > 0 || state.submissionErrors.length > 0,
    }));
  },

  // Notification actions
  addNotification: (notification) => {
    const id = generateId();
    const fullNotification: ErrorNotification = { ...notification, id };

    set((state) => ({
      notifications: [...state.notifications, fullNotification],
    }));

    // Auto-dismiss if configured
    if (notification.autoDismiss) {
      setTimeout(() => {
        get().dismissNotification(id);
      }, notification.autoDismiss);
    }

    return id;
  },

  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAllNotifications: () => {
    set({ notifications: [] });
  },

  // Global clear
  clearAllErrors: () => {
    set({
      hasErrors: false,
      validationErrors: [],
      submissionErrors: [],
      networkError: null,
      notifications: [],
    });
  },
}));
