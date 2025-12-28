import { useEffect, useCallback, useRef } from 'react';
import { useFormCoordinationStore } from '../stores/formCoordinationStore';
import type { FormId, ValidationResult, SubmitResult } from '../types/form-coordination';

interface UseFormRegistrationOptions {
  formId: FormId;
  displayName: string;
}

interface UseFormRegistrationReturn {
  setValidateFunction: (validateFn: () => Promise<ValidationResult>) => void;
  setSubmitFunction: (submitFn: () => Promise<SubmitResult>) => void;
}

/**
 * Hook for child forms to register themselves with the coordination store.
 * This allows the parent to trigger validation and submission on all registered forms.
 */
export function useFormRegistration({
  formId,
  displayName,
}: UseFormRegistrationOptions): UseFormRegistrationReturn {
  const registerForm = useFormCoordinationStore((state) => state.registerForm);
  const unregisterForm = useFormCoordinationStore((state) => state.unregisterForm);

  // Use ref to store the validate function to avoid re-registering on every render
  const validateFnRef = useRef<() => Promise<ValidationResult>>(() =>
    Promise.resolve({ valid: true, errors: [] })
  );

  // Use ref to store the submit function to avoid re-registering on every render
  const submitFnRef = useRef<() => Promise<SubmitResult>>(() =>
    Promise.resolve({ success: true, formId })
  );

  const setValidateFunction = useCallback((validateFn: () => Promise<ValidationResult>) => {
    validateFnRef.current = validateFn;
  }, []);

  const setSubmitFunction = useCallback((submitFn: () => Promise<SubmitResult>) => {
    submitFnRef.current = submitFn;
  }, []);

  useEffect(() => {
    registerForm({
      formId,
      displayName,
      validate: () => validateFnRef.current(),
      submit: () => submitFnRef.current(),
    });

    return () => {
      unregisterForm(formId);
    };
  }, [formId, displayName, registerForm, unregisterForm]);

  return { setValidateFunction, setSubmitFunction };
}
