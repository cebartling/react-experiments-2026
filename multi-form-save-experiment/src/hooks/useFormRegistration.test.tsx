import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormRegistration } from './useFormRegistration';
import { useFormCoordinationStore } from '../stores/formCoordinationStore';

function resetStore() {
  useFormCoordinationStore.setState({
    dirtyForms: new Set(),
    formRegistry: new Map(),
    isValidating: false,
    validationErrors: [],
  });
}

describe('useFormRegistration', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('form registration', () => {
    it('registers form on mount', () => {
      renderHook(() =>
        useFormRegistration({
          formId: 'test-form',
          displayName: 'Test Form',
        })
      );

      const state = useFormCoordinationStore.getState();
      expect(state.formRegistry.has('test-form')).toBe(true);
      expect(state.formRegistry.get('test-form')?.displayName).toBe('Test Form');
    });

    it('unregisters form on unmount', () => {
      const { unmount } = renderHook(() =>
        useFormRegistration({
          formId: 'test-form',
          displayName: 'Test Form',
        })
      );

      unmount();

      const state = useFormCoordinationStore.getState();
      expect(state.formRegistry.has('test-form')).toBe(false);
    });

    it('re-registers form when formId changes', () => {
      const { rerender } = renderHook(
        ({ formId, displayName }) => useFormRegistration({ formId, displayName }),
        {
          initialProps: {
            formId: 'form-1',
            displayName: 'Form One',
          },
        }
      );

      rerender({
        formId: 'form-2',
        displayName: 'Form Two',
      });

      const state = useFormCoordinationStore.getState();
      expect(state.formRegistry.has('form-1')).toBe(false);
      expect(state.formRegistry.has('form-2')).toBe(true);
    });
  });

  describe('validate function', () => {
    it('calls the registered validate function when triggered', async () => {
      const { result } = renderHook(() =>
        useFormRegistration({
          formId: 'test-form',
          displayName: 'Test Form',
        })
      );

      let validateCalled = false;
      act(() => {
        result.current.setValidateFunction(async () => {
          validateCalled = true;
          return { valid: true, errors: [] };
        });
      });

      const state = useFormCoordinationStore.getState();
      const entry = state.formRegistry.get('test-form');
      await entry?.validate();

      expect(validateCalled).toBe(true);
    });

    it('returns default valid result before setValidateFunction is called', async () => {
      renderHook(() =>
        useFormRegistration({
          formId: 'test-form',
          displayName: 'Test Form',
        })
      );

      const state = useFormCoordinationStore.getState();
      const entry = state.formRegistry.get('test-form');
      const result = await entry?.validate();

      expect(result).toEqual({ valid: true, errors: [] });
    });

    it('uses the latest validate function when updated', async () => {
      const { result } = renderHook(() =>
        useFormRegistration({
          formId: 'test-form',
          displayName: 'Test Form',
        })
      );

      act(() => {
        result.current.setValidateFunction(async () => ({
          valid: false,
          errors: [{ field: 'name', message: 'First error' }],
        }));
      });

      act(() => {
        result.current.setValidateFunction(async () => ({
          valid: false,
          errors: [{ field: 'name', message: 'Updated error' }],
        }));
      });

      const state = useFormCoordinationStore.getState();
      const entry = state.formRegistry.get('test-form');
      const validationResult = await entry?.validate();

      expect(validationResult?.errors[0].message).toBe('Updated error');
    });
  });
});
