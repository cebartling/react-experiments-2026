import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useValidatedForm } from './useValidatedForm';
import { useFormCoordinationStore } from '../stores/formCoordinationStore';

function resetStore() {
  useFormCoordinationStore.setState({
    dirtyForms: new Set(),
    formRegistry: new Map(),
    isValidating: false,
    validationErrors: [],
  });
}

const testSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
});

type TestFormData = z.infer<typeof testSchema>;

describe('useValidatedForm', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('form registration and tracking', () => {
    it('registers form with the coordination store on mount', () => {
      renderHook(() =>
        useValidatedForm<TestFormData>({
          formId: 'test-form',
          displayName: 'Test Form',
          resolver: zodResolver(testSchema),
          defaultValues: { name: '', email: '' },
        })
      );

      const state = useFormCoordinationStore.getState();
      expect(state.formRegistry.has('test-form')).toBe(true);
      expect(state.formRegistry.get('test-form')?.displayName).toBe('Test Form');
    });

    it('unregisters form on unmount', () => {
      const { unmount } = renderHook(() =>
        useValidatedForm<TestFormData>({
          formId: 'test-form',
          displayName: 'Test Form',
          resolver: zodResolver(testSchema),
          defaultValues: { name: '', email: '' },
        })
      );

      unmount();

      const state = useFormCoordinationStore.getState();
      expect(state.formRegistry.has('test-form')).toBe(false);
    });

    it('returns formId in the hook result', () => {
      const { result } = renderHook(() =>
        useValidatedForm<TestFormData>({
          formId: 'test-form',
          displayName: 'Test Form',
          resolver: zodResolver(testSchema),
          defaultValues: { name: '', email: '' },
        })
      );

      expect(result.current.formId).toBe('test-form');
    });
  });

  describe('dirty state tracking', () => {
    it('marks form as dirty when field value changes', async () => {
      const { result } = renderHook(() =>
        useValidatedForm<TestFormData>({
          formId: 'test-form',
          displayName: 'Test Form',
          resolver: zodResolver(testSchema),
          defaultValues: { name: '', email: '' },
        })
      );

      await act(async () => {
        result.current.setValue('name', 'John', { shouldDirty: true });
      });

      await waitFor(() => {
        const state = useFormCoordinationStore.getState();
        expect(state.dirtyForms.has('test-form')).toBe(true);
      });
    });

    it('marks form as clean when reset', async () => {
      const { result } = renderHook(() =>
        useValidatedForm<TestFormData>({
          formId: 'test-form',
          displayName: 'Test Form',
          resolver: zodResolver(testSchema),
          defaultValues: { name: '', email: '' },
        })
      );

      await act(async () => {
        result.current.setValue('name', 'John', { shouldDirty: true });
      });

      await waitFor(() => {
        const state = useFormCoordinationStore.getState();
        expect(state.dirtyForms.has('test-form')).toBe(true);
      });

      await act(async () => {
        result.current.reset();
      });

      await waitFor(() => {
        const state = useFormCoordinationStore.getState();
        expect(state.dirtyForms.has('test-form')).toBe(false);
      });
    });
  });

  describe('validation', () => {
    it('returns valid result when form data is valid', async () => {
      renderHook(() =>
        useValidatedForm<TestFormData>({
          formId: 'test-form',
          displayName: 'Test Form',
          resolver: zodResolver(testSchema),
          defaultValues: { name: 'John', email: 'john@example.com' },
        })
      );

      const state = useFormCoordinationStore.getState();
      const entry = state.formRegistry.get('test-form');

      const validationResult = await entry?.validate();

      expect(validationResult?.valid).toBe(true);
      expect(validationResult?.errors).toHaveLength(0);
    });

    it('returns validation errors when form data is invalid', async () => {
      renderHook(() =>
        useValidatedForm<TestFormData>({
          formId: 'test-form',
          displayName: 'Test Form',
          resolver: zodResolver(testSchema),
          defaultValues: { name: '', email: 'invalid-email' },
        })
      );

      // Mark form as dirty and run coordinated validation
      const { markFormDirty, validateAllDirtyForms } = useFormCoordinationStore.getState();
      markFormDirty('test-form');

      let allValid;
      await act(async () => {
        allValid = await validateAllDirtyForms();
      });

      expect(allValid).toBe(false);

      const state = useFormCoordinationStore.getState();
      expect(state.validationErrors).toHaveLength(1);
      expect(state.validationErrors[0].errors.length).toBeGreaterThan(0);
    });

    it('converts React Hook Form errors to ValidationError format', async () => {
      renderHook(() =>
        useValidatedForm<TestFormData>({
          formId: 'test-form',
          displayName: 'Test Form',
          resolver: zodResolver(testSchema),
          defaultValues: { name: '', email: '' },
        })
      );

      // Mark form as dirty and run coordinated validation
      const { markFormDirty, validateAllDirtyForms } = useFormCoordinationStore.getState();
      markFormDirty('test-form');

      await act(async () => {
        await validateAllDirtyForms();
      });

      const state = useFormCoordinationStore.getState();
      expect(state.validationErrors).toHaveLength(1);

      // Check that errors have the correct format
      const nameError = state.validationErrors[0].errors.find((e) => e.field === 'name');
      expect(nameError).toBeDefined();
      expect(nameError?.message).toBe('Name is required');
    });

    it('triggers React Hook Form validation on validate call', async () => {
      const { result } = renderHook(() =>
        useValidatedForm<TestFormData>({
          formId: 'test-form',
          displayName: 'Test Form',
          resolver: zodResolver(testSchema),
          defaultValues: { name: '', email: '' },
        })
      );

      // Initially no errors are shown (form hasn't been validated)
      expect(Object.keys(result.current.formState.errors)).toHaveLength(0);

      const state = useFormCoordinationStore.getState();
      const entry = state.formRegistry.get('test-form');

      await act(async () => {
        await entry?.validate();
      });

      // After validation, errors should be populated
      await waitFor(() => {
        expect(Object.keys(result.current.formState.errors).length).toBeGreaterThan(0);
      });
    });
  });

  describe('integration with validateAllDirtyForms', () => {
    it('participates in coordinated validation', async () => {
      renderHook(() =>
        useValidatedForm<TestFormData>({
          formId: 'test-form',
          displayName: 'Test Form',
          resolver: zodResolver(testSchema),
          defaultValues: { name: '', email: '' },
        })
      );

      // Mark the form as dirty
      const { markFormDirty, validateAllDirtyForms } = useFormCoordinationStore.getState();
      markFormDirty('test-form');

      // Run coordinated validation
      const allValid = await validateAllDirtyForms();

      expect(allValid).toBe(false);

      const state = useFormCoordinationStore.getState();
      expect(state.validationErrors).toHaveLength(1);
      expect(state.validationErrors[0].formId).toBe('test-form');
      expect(state.validationErrors[0].formName).toBe('Test Form');
    });
  });
});
