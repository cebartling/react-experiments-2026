import { useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import type {
  UseFormProps,
  UseFormReturn,
  FieldValues,
  FieldErrors,
  Resolver,
} from 'react-hook-form';
import { useDirtyTracking } from './useDirtyTracking';
import { useFormCoordinationStore } from '../stores/formCoordinationStore';
import { submitForm } from '../services/formSubmissionService';
import type {
  FormId,
  ValidationResult,
  SubmitResult,
  ValidationError,
} from '../types/form-coordination';

interface UseSubmittableFormOptions<T extends FieldValues> extends UseFormProps<T> {
  formId: FormId;
  displayName: string;
}

interface UseSubmittableFormReturn<T extends FieldValues> extends UseFormReturn<T> {
  formId: FormId;
}

/**
 * Converts React Hook Form errors to our ValidationError format
 */
function convertErrors<T extends FieldValues>(errors: FieldErrors<T>): ValidationError[] {
  const result: ValidationError[] = [];

  function processErrors(obj: FieldErrors<T>, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fieldPath = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object') {
        if ('message' in value && typeof value.message === 'string') {
          result.push({ field: fieldPath, message: value.message });
        } else {
          processErrors(value as FieldErrors<T>, fieldPath);
        }
      }
    }
  }

  processErrors(errors);
  return result;
}

/**
 * Comprehensive hook that combines form tracking, validation, and submission.
 */
export function useSubmittableForm<T extends FieldValues>({
  formId,
  displayName,
  resolver,
  ...formOptions
}: UseSubmittableFormOptions<T>): UseSubmittableFormReturn<T> {
  const form = useForm<T>({ resolver, ...formOptions });
  const { reportDirtyState } = useDirtyTracking({ formId });

  const registerForm = useFormCoordinationStore((state) => state.registerForm);
  const unregisterForm = useFormCoordinationStore((state) => state.unregisterForm);

  const { isDirty } = form.formState;
  const { trigger, getValues, reset } = form;

  // Store refs to avoid stale closures
  const formRef = useRef(form);

  // Store resolver reference for direct validation
  const resolverRef = useRef<Resolver<T> | undefined>(resolver);

  // Update refs in effects to comply with React rules
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  useEffect(() => {
    resolverRef.current = resolver;
  }, [resolver]);

  // Report dirty state changes
  useEffect(() => {
    reportDirtyState(isDirty);
  }, [isDirty, reportDirtyState]);

  // Validation function
  const validateForm = useCallback(async (): Promise<ValidationResult> => {
    const currentForm = formRef.current;
    const currentResolver = resolverRef.current;

    // Trigger validation to update UI state
    const isValid = await trigger();

    if (isValid) {
      return { valid: true, errors: [] };
    }

    // If we have a resolver, use it directly to get errors
    if (currentResolver) {
      const values = currentForm.getValues();
      const resolverResult = await currentResolver(values, {}, {} as never);
      if (resolverResult.errors && Object.keys(resolverResult.errors).length > 0) {
        const errors = convertErrors(resolverResult.errors);
        return { valid: false, errors };
      }
    }

    // Fallback: try to get errors from formState
    const currentErrors = currentForm.formState.errors;
    const errors = convertErrors(currentErrors);
    return { valid: false, errors };
  }, [trigger]);

  // Submission function
  const submitFormData = useCallback(async (): Promise<SubmitResult> => {
    const data = getValues();
    const result = await submitForm(formId, data);

    if (result.success) {
      // Reset form to current values as new defaults
      reset(data, { keepValues: true, keepDirty: false });
    }

    return result;
  }, [formId, getValues, reset]);

  // Register form with coordination store
  useEffect(() => {
    registerForm({
      formId,
      displayName,
      validate: validateForm,
      submit: submitFormData,
    });

    return () => {
      unregisterForm(formId);
    };
  }, [formId, displayName, validateForm, submitFormData, registerForm, unregisterForm]);

  return {
    ...form,
    formId,
  };
}
