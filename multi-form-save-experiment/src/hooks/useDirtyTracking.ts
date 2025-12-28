import { useEffect, useCallback } from 'react';
import { useFormCoordinationStore } from '../stores/formCoordinationStore';
import type { FormId } from '../types/form-coordination';

interface UseDirtyTrackingOptions {
  formId: FormId;
}

interface UseDirtyTrackingReturn {
  reportDirtyState: (isDirty: boolean) => void;
}

/**
 * Hook for child forms to report their dirty state to the parent container.
 * Automatically cleans up when the component unmounts.
 */
export function useDirtyTracking({ formId }: UseDirtyTrackingOptions): UseDirtyTrackingReturn {
  const markFormDirty = useFormCoordinationStore((state) => state.markFormDirty);
  const markFormClean = useFormCoordinationStore((state) => state.markFormClean);

  // Cleanup on unmount - mark form as clean
  useEffect(() => {
    return () => {
      markFormClean(formId);
    };
  }, [formId, markFormClean]);

  const reportDirtyState = useCallback(
    (isDirty: boolean) => {
      if (isDirty) {
        markFormDirty(formId);
      } else {
        markFormClean(formId);
      }
    },
    [formId, markFormDirty, markFormClean]
  );

  return { reportDirtyState };
}
