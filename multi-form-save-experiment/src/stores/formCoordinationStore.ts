import { create } from 'zustand';
import type {
  FormId,
  FormRegistryEntry,
  FormValidationSummary,
  SubmitResult,
  SubmissionStatus,
  SubmissionSummary,
} from '../types/form-coordination';
import { useErrorStore } from './errorStore';
import { toValidationError, toSubmissionError, createNetworkError } from '../utils/error-utils';

interface FormCoordinationStoreState {
  // Dirty state
  dirtyForms: Set<FormId>;
  markFormDirty: (formId: FormId) => void;
  markFormClean: (formId: FormId) => void;
  resetAllDirtyState: () => void;

  // Form registry
  formRegistry: Map<FormId, FormRegistryEntry>;
  registerForm: (entry: FormRegistryEntry) => void;
  unregisterForm: (formId: FormId) => void;

  // Validation state
  isValidating: boolean;
  validationErrors: FormValidationSummary[];
  validateAllDirtyForms: () => Promise<boolean>;
  clearValidationErrors: () => void;

  // Submission state
  submissionStatus: SubmissionStatus;
  submissionSummary: SubmissionSummary | null;
  submitAllDirtyForms: () => Promise<boolean>;
  resetSubmissionState: () => void;

  // Combined save operation
  saveAllChanges: () => Promise<boolean>;
}

export const useFormCoordinationStore = create<FormCoordinationStoreState>((set, get) => ({
  // Dirty state
  dirtyForms: new Set<FormId>(),

  markFormDirty: (formId: FormId) => {
    set((state) => {
      const next = new Set(state.dirtyForms);
      next.add(formId);
      return { dirtyForms: next };
    });
  },

  markFormClean: (formId: FormId) => {
    set((state) => {
      const next = new Set(state.dirtyForms);
      next.delete(formId);
      return { dirtyForms: next };
    });
  },

  resetAllDirtyState: () => {
    set({ dirtyForms: new Set() });
  },

  // Form registry
  formRegistry: new Map<FormId, FormRegistryEntry>(),

  registerForm: (entry: FormRegistryEntry) => {
    set((state) => {
      const next = new Map(state.formRegistry);
      next.set(entry.formId, entry);
      return { formRegistry: next };
    });
  },

  unregisterForm: (formId: FormId) => {
    set((state) => {
      const next = new Map(state.formRegistry);
      next.delete(formId);
      return { formRegistry: next };
    });
  },

  // Validation state
  isValidating: false,
  validationErrors: [],

  validateAllDirtyForms: async () => {
    const { dirtyForms, formRegistry } = get();

    set({ isValidating: true, validationErrors: [] });

    const validationPromises: Promise<FormValidationSummary | null>[] = [];

    for (const formId of dirtyForms) {
      const entry = formRegistry.get(formId);
      if (entry) {
        validationPromises.push(
          entry.validate().then((result) => {
            if (!result.valid) {
              return {
                formId: entry.formId,
                formName: entry.displayName,
                errors: result.errors,
              };
            }
            return null;
          })
        );
      }
    }

    const results = await Promise.all(validationPromises);
    const errors = results.filter((r): r is FormValidationSummary => r !== null);

    set({ isValidating: false, validationErrors: errors });

    return errors.length === 0;
  },

  clearValidationErrors: () => {
    set({ validationErrors: [] });
  },

  // Submission state
  submissionStatus: 'idle',
  submissionSummary: null,

  submitAllDirtyForms: async () => {
    const { dirtyForms, formRegistry } = get();

    set({ submissionStatus: 'submitting' });

    const submissionPromises: Promise<SubmitResult>[] = [];

    for (const formId of dirtyForms) {
      const entry = formRegistry.get(formId);
      if (entry) {
        submissionPromises.push(
          entry.submit().catch((error) => ({
            success: false,
            formId,
            error: error instanceof Error ? error.message : 'Unknown error',
          }))
        );
      }
    }

    const results = await Promise.all(submissionPromises);

    const successfulForms = results.filter((r) => r.success).map((r) => r.formId);
    const failedForms = results.filter((r) => !r.success);

    const allSuccessful = failedForms.length === 0;

    const summary: SubmissionSummary = {
      status: allSuccessful ? 'success' : 'error',
      successfulForms,
      failedForms,
    };

    set({
      submissionStatus: allSuccessful ? 'success' : 'error',
      submissionSummary: summary,
    });

    // Reset dirty state only for successful submissions
    if (allSuccessful) {
      set({ dirtyForms: new Set() });
    } else {
      // Remove only successful forms from dirty set
      set((state) => {
        const next = new Set(state.dirtyForms);
        successfulForms.forEach((id) => next.delete(id));
        return { dirtyForms: next };
      });
    }

    return allSuccessful;
  },

  resetSubmissionState: () => {
    set({
      submissionStatus: 'idle',
      submissionSummary: null,
    });
  },

  // Combined save operation
  saveAllChanges: async () => {
    const { validateAllDirtyForms, submitAllDirtyForms, clearValidationErrors, formRegistry } =
      get();
    const errorStore = useErrorStore.getState();

    // Clear previous errors
    errorStore.clearAllErrors();
    clearValidationErrors();

    try {
      // Step 1: Validate all dirty forms
      const allValid = await validateAllDirtyForms();

      if (!allValid) {
        const validationSummaries = get().validationErrors;
        const validationErrors = validationSummaries.map(toValidationError);
        errorStore.setValidationErrors(validationErrors);
        return false;
      }

      // Step 2: Submit all dirty forms
      const allSubmitted = await submitAllDirtyForms();

      if (!allSubmitted) {
        const summary = get().submissionSummary;
        if (summary) {
          const formNames = new Map<string, string>();
          formRegistry.forEach((entry) => {
            formNames.set(entry.formId, entry.displayName);
          });

          const submissionErrors = summary.failedForms.map((result) =>
            toSubmissionError(result, formNames.get(result.formId) ?? result.formId)
          );
          errorStore.setSubmissionErrors(submissionErrors);
        }
        return false;
      }

      // Success notification
      errorStore.addNotification({
        severity: 'info',
        title: 'Saved',
        message: 'All changes have been saved successfully.',
        dismissible: true,
        autoDismiss: 3000,
      });

      return true;
    } catch (error) {
      // Handle unexpected errors
      const networkError = createNetworkError(error);
      errorStore.setNetworkError(networkError);
      return false;
    }
  },
}));

/**
 * Selector to check if any forms are dirty.
 * Use this with useFormCoordinationStore for reactive updates.
 */
export const selectIsDirty = (state: FormCoordinationStoreState): boolean =>
  state.dirtyForms.size > 0;
