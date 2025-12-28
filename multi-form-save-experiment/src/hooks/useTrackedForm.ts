import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import { useDirtyTracking } from './useDirtyTracking';
import type { FormId } from '../types/form-coordination';

interface UseTrackedFormOptions<T extends FieldValues> extends UseFormProps<T> {
  formId: FormId;
}

/**
 * Wrapper around React Hook Form's useForm that automatically
 * tracks and reports dirty state to the coordination store.
 */
export function useTrackedForm<T extends FieldValues>({
  formId,
  ...formOptions
}: UseTrackedFormOptions<T>): UseFormReturn<T> {
  const form = useForm<T>(formOptions);
  const { reportDirtyState } = useDirtyTracking({ formId });

  const { isDirty } = form.formState;

  useEffect(() => {
    reportDirtyState(isDirty);
  }, [isDirty, reportDirtyState]);

  return form;
}
