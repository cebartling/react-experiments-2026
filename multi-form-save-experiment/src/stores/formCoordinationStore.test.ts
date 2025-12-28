import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFormCoordinationStore, selectIsDirty } from './formCoordinationStore';
import type { FormRegistryEntry } from '../types/form-coordination';

function resetStore() {
  const store = useFormCoordinationStore.getState();
  store.resetAllDirtyState();
  store.clearValidationErrors();
  store.resetSubmissionState();
  // Reset form registry
  useFormCoordinationStore.setState({
    formRegistry: new Map(),
    isValidating: false,
  });
}

/**
 * Creates a mock registry entry with default submit function
 */
function createMockEntry(
  formId: string,
  displayName: string,
  validate: () => Promise<{ valid: boolean; errors: Array<{ field: string; message: string }> }>,
  submit?: () => Promise<{ success: boolean; formId: string; error?: string }>
): FormRegistryEntry {
  return {
    formId,
    displayName,
    validate,
    submit: submit ?? vi.fn().mockResolvedValue({ success: true, formId }),
  };
}

describe('formCoordinationStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('markFormDirty', () => {
    it('adds form ID to the dirty forms set', () => {
      const { markFormDirty } = useFormCoordinationStore.getState();

      markFormDirty('form-1');

      const state = useFormCoordinationStore.getState();
      expect(state.dirtyForms.has('form-1')).toBe(true);
      expect(state.dirtyForms.size).toBe(1);
    });

    it('can mark multiple forms as dirty', () => {
      const { markFormDirty } = useFormCoordinationStore.getState();

      markFormDirty('form-1');
      markFormDirty('form-2');
      markFormDirty('form-3');

      const state = useFormCoordinationStore.getState();
      expect(state.dirtyForms.size).toBe(3);
      expect(state.dirtyForms.has('form-1')).toBe(true);
      expect(state.dirtyForms.has('form-2')).toBe(true);
      expect(state.dirtyForms.has('form-3')).toBe(true);
    });

    it('does not duplicate form IDs when marked dirty multiple times', () => {
      const { markFormDirty } = useFormCoordinationStore.getState();

      markFormDirty('form-1');
      markFormDirty('form-1');
      markFormDirty('form-1');

      const state = useFormCoordinationStore.getState();
      expect(state.dirtyForms.size).toBe(1);
    });
  });

  describe('markFormClean', () => {
    it('removes form ID from the dirty forms set', () => {
      const { markFormDirty, markFormClean } = useFormCoordinationStore.getState();

      markFormDirty('form-1');
      markFormClean('form-1');

      const state = useFormCoordinationStore.getState();
      expect(state.dirtyForms.has('form-1')).toBe(false);
      expect(state.dirtyForms.size).toBe(0);
    });

    it('does not throw when removing a form ID that is not in the set', () => {
      const { markFormClean } = useFormCoordinationStore.getState();

      expect(() => markFormClean('nonexistent')).not.toThrow();
    });

    it('only removes the specified form ID', () => {
      const { markFormDirty, markFormClean } = useFormCoordinationStore.getState();

      markFormDirty('form-1');
      markFormDirty('form-2');
      markFormClean('form-1');

      const state = useFormCoordinationStore.getState();
      expect(state.dirtyForms.has('form-1')).toBe(false);
      expect(state.dirtyForms.has('form-2')).toBe(true);
      expect(state.dirtyForms.size).toBe(1);
    });
  });

  describe('selectIsDirty', () => {
    it('returns true when at least one form is dirty', () => {
      const { markFormDirty } = useFormCoordinationStore.getState();

      markFormDirty('form-1');

      const state = useFormCoordinationStore.getState();
      expect(selectIsDirty(state)).toBe(true);
    });

    it('returns false when no forms are dirty', () => {
      const state = useFormCoordinationStore.getState();
      expect(selectIsDirty(state)).toBe(false);
    });

    it('returns false after all forms are marked clean', () => {
      const { markFormDirty, markFormClean } = useFormCoordinationStore.getState();

      markFormDirty('form-1');
      markFormDirty('form-2');
      markFormClean('form-1');
      markFormClean('form-2');

      const state = useFormCoordinationStore.getState();
      expect(selectIsDirty(state)).toBe(false);
    });
  });

  describe('resetAllDirtyState', () => {
    it('clears all form IDs from the dirty set', () => {
      const { markFormDirty, resetAllDirtyState } = useFormCoordinationStore.getState();

      markFormDirty('form-1');
      markFormDirty('form-2');
      markFormDirty('form-3');
      resetAllDirtyState();

      const state = useFormCoordinationStore.getState();
      expect(state.dirtyForms.size).toBe(0);
      expect(selectIsDirty(state)).toBe(false);
    });

    it('can be called on an already empty set without error', () => {
      const { resetAllDirtyState } = useFormCoordinationStore.getState();

      expect(() => resetAllDirtyState()).not.toThrow();
      expect(useFormCoordinationStore.getState().dirtyForms.size).toBe(0);
    });
  });

  describe('registerForm', () => {
    it('adds entry to the form registry', () => {
      const { registerForm } = useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({ valid: true, errors: [] });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate));

      const state = useFormCoordinationStore.getState();
      expect(state.formRegistry.has('form-1')).toBe(true);
      expect(state.formRegistry.get('form-1')?.displayName).toBe('Form One');
    });

    it('can register multiple forms', () => {
      const { registerForm } = useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({ valid: true, errors: [] });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate));
      registerForm(createMockEntry('form-2', 'Form Two', mockValidate));

      const state = useFormCoordinationStore.getState();
      expect(state.formRegistry.size).toBe(2);
    });

    it('overwrites existing entry with same formId', () => {
      const { registerForm } = useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({ valid: true, errors: [] });

      registerForm(createMockEntry('form-1', 'Original Name', mockValidate));
      registerForm(createMockEntry('form-1', 'Updated Name', mockValidate));

      const state = useFormCoordinationStore.getState();
      expect(state.formRegistry.size).toBe(1);
      expect(state.formRegistry.get('form-1')?.displayName).toBe('Updated Name');
    });
  });

  describe('unregisterForm', () => {
    it('removes entry from the form registry', () => {
      const { registerForm, unregisterForm } = useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({ valid: true, errors: [] });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate));
      unregisterForm('form-1');

      const state = useFormCoordinationStore.getState();
      expect(state.formRegistry.has('form-1')).toBe(false);
    });

    it('does not throw when removing a non-existent form', () => {
      const { unregisterForm } = useFormCoordinationStore.getState();

      expect(() => unregisterForm('nonexistent')).not.toThrow();
    });

    it('only removes the specified form', () => {
      const { registerForm, unregisterForm } = useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({ valid: true, errors: [] });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate));
      registerForm(createMockEntry('form-2', 'Form Two', mockValidate));
      unregisterForm('form-1');

      const state = useFormCoordinationStore.getState();
      expect(state.formRegistry.has('form-1')).toBe(false);
      expect(state.formRegistry.has('form-2')).toBe(true);
    });
  });

  describe('validateAllDirtyForms', () => {
    it('only validates dirty forms', async () => {
      const { registerForm, markFormDirty, validateAllDirtyForms } =
        useFormCoordinationStore.getState();
      const mockValidate1 = vi.fn().mockResolvedValue({ valid: true, errors: [] });
      const mockValidate2 = vi.fn().mockResolvedValue({ valid: true, errors: [] });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate1));
      registerForm(createMockEntry('form-2', 'Form Two', mockValidate2));

      markFormDirty('form-1');
      // form-2 is NOT marked dirty

      await validateAllDirtyForms();

      expect(mockValidate1).toHaveBeenCalled();
      expect(mockValidate2).not.toHaveBeenCalled();
    });

    it('collects all errors from multiple forms', async () => {
      const { registerForm, markFormDirty, validateAllDirtyForms } =
        useFormCoordinationStore.getState();
      const mockValidate1 = vi.fn().mockResolvedValue({
        valid: false,
        errors: [{ field: 'name', message: 'Name is required' }],
      });
      const mockValidate2 = vi.fn().mockResolvedValue({
        valid: false,
        errors: [{ field: 'email', message: 'Invalid email' }],
      });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate1));
      registerForm(createMockEntry('form-2', 'Form Two', mockValidate2));

      markFormDirty('form-1');
      markFormDirty('form-2');

      await validateAllDirtyForms();

      const state = useFormCoordinationStore.getState();
      expect(state.validationErrors).toHaveLength(2);
      expect(state.validationErrors[0].formName).toBe('Form One');
      expect(state.validationErrors[1].formName).toBe('Form Two');
    });

    it('returns true when all forms are valid', async () => {
      const { registerForm, markFormDirty, validateAllDirtyForms } =
        useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({ valid: true, errors: [] });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate));

      markFormDirty('form-1');

      const result = await validateAllDirtyForms();

      expect(result).toBe(true);
    });

    it('returns false when any form is invalid', async () => {
      const { registerForm, markFormDirty, validateAllDirtyForms } =
        useFormCoordinationStore.getState();
      const mockValidateValid = vi.fn().mockResolvedValue({ valid: true, errors: [] });
      const mockValidateInvalid = vi.fn().mockResolvedValue({
        valid: false,
        errors: [{ field: 'name', message: 'Required' }],
      });

      registerForm(createMockEntry('form-1', 'Form One', mockValidateValid));
      registerForm(createMockEntry('form-2', 'Form Two', mockValidateInvalid));

      markFormDirty('form-1');
      markFormDirty('form-2');

      const result = await validateAllDirtyForms();

      expect(result).toBe(false);
    });

    it('sets isValidating to true while validating', async () => {
      const { registerForm, markFormDirty, validateAllDirtyForms } =
        useFormCoordinationStore.getState();

      let capturedIsValidating = false;
      const mockValidate = vi.fn().mockImplementation(async () => {
        capturedIsValidating = useFormCoordinationStore.getState().isValidating;
        return { valid: true, errors: [] };
      });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate));

      markFormDirty('form-1');

      await validateAllDirtyForms();

      expect(capturedIsValidating).toBe(true);
    });

    it('sets isValidating to false after validation completes', async () => {
      const { registerForm, markFormDirty, validateAllDirtyForms } =
        useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({ valid: true, errors: [] });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate));

      markFormDirty('form-1');

      await validateAllDirtyForms();

      const state = useFormCoordinationStore.getState();
      expect(state.isValidating).toBe(false);
    });

    it('runs validation in parallel for all dirty forms', async () => {
      const { registerForm, markFormDirty, validateAllDirtyForms } =
        useFormCoordinationStore.getState();

      const callOrder: string[] = [];

      const mockValidate1 = vi.fn().mockImplementation(async () => {
        callOrder.push('start-1');
        await new Promise((resolve) => setTimeout(resolve, 50));
        callOrder.push('end-1');
        return { valid: true, errors: [] };
      });

      const mockValidate2 = vi.fn().mockImplementation(async () => {
        callOrder.push('start-2');
        await new Promise((resolve) => setTimeout(resolve, 50));
        callOrder.push('end-2');
        return { valid: true, errors: [] };
      });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate1));
      registerForm(createMockEntry('form-2', 'Form Two', mockValidate2));

      markFormDirty('form-1');
      markFormDirty('form-2');

      await validateAllDirtyForms();

      // Both should start before either ends (parallel execution)
      expect(callOrder[0]).toBe('start-1');
      expect(callOrder[1]).toBe('start-2');
    });
  });

  describe('clearValidationErrors', () => {
    it('resets the validation errors array', async () => {
      const { registerForm, markFormDirty, validateAllDirtyForms, clearValidationErrors } =
        useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({
        valid: false,
        errors: [{ field: 'name', message: 'Required' }],
      });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate));

      markFormDirty('form-1');
      await validateAllDirtyForms();

      clearValidationErrors();

      const state = useFormCoordinationStore.getState();
      expect(state.validationErrors).toHaveLength(0);
    });
  });

  describe('submitAllDirtyForms', () => {
    it('only submits dirty forms', async () => {
      const { registerForm, markFormDirty, submitAllDirtyForms } =
        useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({ valid: true, errors: [] });
      const mockSubmit1 = vi.fn().mockResolvedValue({ success: true, formId: 'form-1' });
      const mockSubmit2 = vi.fn().mockResolvedValue({ success: true, formId: 'form-2' });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate, mockSubmit1));
      registerForm(createMockEntry('form-2', 'Form Two', mockValidate, mockSubmit2));

      markFormDirty('form-1');
      // form-2 is NOT marked dirty

      await submitAllDirtyForms();

      expect(mockSubmit1).toHaveBeenCalled();
      expect(mockSubmit2).not.toHaveBeenCalled();
    });

    it('sets submissionStatus to submitting during submission', async () => {
      const { registerForm, markFormDirty, submitAllDirtyForms } =
        useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({ valid: true, errors: [] });

      let capturedStatus = '';
      const mockSubmit = vi.fn().mockImplementation(async () => {
        capturedStatus = useFormCoordinationStore.getState().submissionStatus;
        return { success: true, formId: 'form-1' };
      });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate, mockSubmit));
      markFormDirty('form-1');

      await submitAllDirtyForms();

      expect(capturedStatus).toBe('submitting');
    });

    it('sets submissionStatus to success when all submissions succeed', async () => {
      const { registerForm, markFormDirty, submitAllDirtyForms } =
        useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({ valid: true, errors: [] });
      const mockSubmit = vi.fn().mockResolvedValue({ success: true, formId: 'form-1' });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate, mockSubmit));
      markFormDirty('form-1');

      await submitAllDirtyForms();

      const state = useFormCoordinationStore.getState();
      expect(state.submissionStatus).toBe('success');
    });

    it('sets submissionStatus to error when any submission fails', async () => {
      const { registerForm, markFormDirty, submitAllDirtyForms } =
        useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({ valid: true, errors: [] });
      const mockSubmit1 = vi.fn().mockResolvedValue({ success: true, formId: 'form-1' });
      const mockSubmit2 = vi
        .fn()
        .mockResolvedValue({ success: false, formId: 'form-2', error: 'Server error' });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate, mockSubmit1));
      registerForm(createMockEntry('form-2', 'Form Two', mockValidate, mockSubmit2));
      markFormDirty('form-1');
      markFormDirty('form-2');

      await submitAllDirtyForms();

      const state = useFormCoordinationStore.getState();
      expect(state.submissionStatus).toBe('error');
    });

    it('resets all dirty state when all submissions succeed', async () => {
      const { registerForm, markFormDirty, submitAllDirtyForms } =
        useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({ valid: true, errors: [] });
      const mockSubmit1 = vi.fn().mockResolvedValue({ success: true, formId: 'form-1' });
      const mockSubmit2 = vi.fn().mockResolvedValue({ success: true, formId: 'form-2' });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate, mockSubmit1));
      registerForm(createMockEntry('form-2', 'Form Two', mockValidate, mockSubmit2));
      markFormDirty('form-1');
      markFormDirty('form-2');

      await submitAllDirtyForms();

      const state = useFormCoordinationStore.getState();
      expect(state.dirtyForms.size).toBe(0);
    });

    it('only removes successful forms from dirty set on partial failure', async () => {
      const { registerForm, markFormDirty, submitAllDirtyForms } =
        useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({ valid: true, errors: [] });
      const mockSubmit1 = vi.fn().mockResolvedValue({ success: true, formId: 'form-1' });
      const mockSubmit2 = vi
        .fn()
        .mockResolvedValue({ success: false, formId: 'form-2', error: 'Server error' });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate, mockSubmit1));
      registerForm(createMockEntry('form-2', 'Form Two', mockValidate, mockSubmit2));
      markFormDirty('form-1');
      markFormDirty('form-2');

      await submitAllDirtyForms();

      const state = useFormCoordinationStore.getState();
      expect(state.dirtyForms.has('form-1')).toBe(false);
      expect(state.dirtyForms.has('form-2')).toBe(true);
    });

    it('creates submission summary with successful and failed forms', async () => {
      const { registerForm, markFormDirty, submitAllDirtyForms } =
        useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({ valid: true, errors: [] });
      const mockSubmit1 = vi.fn().mockResolvedValue({ success: true, formId: 'form-1' });
      const mockSubmit2 = vi
        .fn()
        .mockResolvedValue({ success: false, formId: 'form-2', error: 'Server error' });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate, mockSubmit1));
      registerForm(createMockEntry('form-2', 'Form Two', mockValidate, mockSubmit2));
      markFormDirty('form-1');
      markFormDirty('form-2');

      await submitAllDirtyForms();

      const state = useFormCoordinationStore.getState();
      expect(state.submissionSummary).not.toBeNull();
      expect(state.submissionSummary?.successfulForms).toContain('form-1');
      expect(state.submissionSummary?.failedForms).toHaveLength(1);
      expect(state.submissionSummary?.failedForms[0].formId).toBe('form-2');
    });

    it('runs submissions in parallel', async () => {
      const { registerForm, markFormDirty, submitAllDirtyForms } =
        useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({ valid: true, errors: [] });

      const callOrder: string[] = [];

      const mockSubmit1 = vi.fn().mockImplementation(async () => {
        callOrder.push('start-1');
        await new Promise((resolve) => setTimeout(resolve, 50));
        callOrder.push('end-1');
        return { success: true, formId: 'form-1' };
      });

      const mockSubmit2 = vi.fn().mockImplementation(async () => {
        callOrder.push('start-2');
        await new Promise((resolve) => setTimeout(resolve, 50));
        callOrder.push('end-2');
        return { success: true, formId: 'form-2' };
      });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate, mockSubmit1));
      registerForm(createMockEntry('form-2', 'Form Two', mockValidate, mockSubmit2));
      markFormDirty('form-1');
      markFormDirty('form-2');

      await submitAllDirtyForms();

      // Both should start before either ends (parallel execution)
      expect(callOrder[0]).toBe('start-1');
      expect(callOrder[1]).toBe('start-2');
    });

    it('catches and handles exceptions from submit functions', async () => {
      const { registerForm, markFormDirty, submitAllDirtyForms } =
        useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({ valid: true, errors: [] });
      const mockSubmit = vi.fn().mockRejectedValue(new Error('Network error'));

      registerForm(createMockEntry('form-1', 'Form One', mockValidate, mockSubmit));
      markFormDirty('form-1');

      await submitAllDirtyForms();

      const state = useFormCoordinationStore.getState();
      expect(state.submissionStatus).toBe('error');
      expect(state.submissionSummary?.failedForms[0].error).toBe('Network error');
    });
  });

  describe('resetSubmissionState', () => {
    it('resets submission status to idle', async () => {
      const { registerForm, markFormDirty, submitAllDirtyForms, resetSubmissionState } =
        useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({ valid: true, errors: [] });
      const mockSubmit = vi.fn().mockResolvedValue({ success: true, formId: 'form-1' });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate, mockSubmit));
      markFormDirty('form-1');
      await submitAllDirtyForms();

      resetSubmissionState();

      const state = useFormCoordinationStore.getState();
      expect(state.submissionStatus).toBe('idle');
      expect(state.submissionSummary).toBeNull();
    });
  });

  describe('saveAllChanges', () => {
    it('validates before submitting', async () => {
      const { registerForm, markFormDirty, saveAllChanges } = useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({ valid: true, errors: [] });
      const mockSubmit = vi.fn().mockResolvedValue({ success: true, formId: 'form-1' });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate, mockSubmit));
      markFormDirty('form-1');

      await saveAllChanges();

      expect(mockValidate).toHaveBeenCalled();
      expect(mockSubmit).toHaveBeenCalled();
    });

    it('does not submit if validation fails', async () => {
      const { registerForm, markFormDirty, saveAllChanges } = useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({
        valid: false,
        errors: [{ field: 'name', message: 'Required' }],
      });
      const mockSubmit = vi.fn().mockResolvedValue({ success: true, formId: 'form-1' });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate, mockSubmit));
      markFormDirty('form-1');

      const result = await saveAllChanges();

      expect(mockValidate).toHaveBeenCalled();
      expect(mockSubmit).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('returns true when all validations and submissions succeed', async () => {
      const { registerForm, markFormDirty, saveAllChanges } = useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({ valid: true, errors: [] });
      const mockSubmit = vi.fn().mockResolvedValue({ success: true, formId: 'form-1' });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate, mockSubmit));
      markFormDirty('form-1');

      const result = await saveAllChanges();

      expect(result).toBe(true);
    });

    it('returns false when submission fails', async () => {
      const { registerForm, markFormDirty, saveAllChanges } = useFormCoordinationStore.getState();
      const mockValidate = vi.fn().mockResolvedValue({ valid: true, errors: [] });
      const mockSubmit = vi
        .fn()
        .mockResolvedValue({ success: false, formId: 'form-1', error: 'Server error' });

      registerForm(createMockEntry('form-1', 'Form One', mockValidate, mockSubmit));
      markFormDirty('form-1');

      const result = await saveAllChanges();

      expect(result).toBe(false);
    });

    it('clears validation errors before validating', async () => {
      const { registerForm, markFormDirty, saveAllChanges, validateAllDirtyForms } =
        useFormCoordinationStore.getState();

      // First, create some validation errors
      const mockValidateInvalid = vi.fn().mockResolvedValue({
        valid: false,
        errors: [{ field: 'name', message: 'Required' }],
      });
      registerForm(createMockEntry('form-1', 'Form One', mockValidateInvalid));
      markFormDirty('form-1');
      await validateAllDirtyForms();

      // Now update to valid
      const mockValidateValid = vi.fn().mockResolvedValue({ valid: true, errors: [] });
      const mockSubmit = vi.fn().mockResolvedValue({ success: true, formId: 'form-1' });
      registerForm(createMockEntry('form-1', 'Form One', mockValidateValid, mockSubmit));

      await saveAllChanges();

      const state = useFormCoordinationStore.getState();
      expect(state.validationErrors).toHaveLength(0);
    });
  });
});
