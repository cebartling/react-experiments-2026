import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import type {
  UseFormProps,
  UseFormReturn,
  FieldValues,
  FieldErrors,
  Resolver,
} from 'react-hook-form';
import { useDirtyTracking } from './useDirtyTracking';
import { useFormRegistration } from './useFormRegistration';
import { submitForm } from '../services/formSubmissionService';
import type {
  FormId,
  ValidationResult,
  ValidationError,
  SubmitResult,
} from '../types/form-coordination';

interface UseValidatedFormOptions<T extends FieldValues> extends UseFormProps<T> {
  formId: FormId;
  displayName: string;
}

interface UseValidatedFormReturn<T extends FieldValues> extends UseFormReturn<T> {
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
          result.push({
            field: fieldPath,
            message: value.message,
          });
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
 * Comprehensive hook that combines React Hook Form with dirty tracking
 * and validation registration for coordinated form management.
 */
export function useValidatedForm<T extends FieldValues>({
  formId,
  displayName,
  resolver,
  ...formOptions
}: UseValidatedFormOptions<T>): UseValidatedFormReturn<T> {
  const form = useForm<T>({ resolver, ...formOptions });
  const { reportDirtyState } = useDirtyTracking({ formId });
  const { setValidateFunction, setSubmitFunction } = useFormRegistration({ formId, displayName });

  // Store form reference to access fresh state in validation callback
  const formRef = useRef(form);

  // Store resolver reference for direct validation
  const resolverRef = useRef<Resolver<T> | undefined>(resolver);

  const { isDirty } = form.formState;

  // Update refs in effect to comply with React rules
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

  // Register the validation function once on mount
  useEffect(() => {
    const validateForm = async (): Promise<ValidationResult> => {
      const currentForm = formRef.current;
      const currentResolver = resolverRef.current;

      // Trigger validation to update UI state
      const isValid = await currentForm.trigger();

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
    };

    setValidateFunction(validateForm);
  }, [setValidateFunction]);

  // Register the submit function
  useEffect(() => {
    const submitFormData = async (): Promise<SubmitResult> => {
      const currentForm = formRef.current;
      const data = currentForm.getValues();
      const result = await submitForm(formId, data);

      if (result.success) {
        // Reset form to current values as new defaults
        currentForm.reset(data, { keepValues: true, keepDirty: false });
      }

      return result;
    };

    setSubmitFunction(submitFormData);
  }, [formId, setSubmitFunction]);

  return {
    ...form,
    formId,
  };
}
