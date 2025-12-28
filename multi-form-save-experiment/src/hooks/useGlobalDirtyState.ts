import { useFormCoordinationStore } from '../stores/formCoordinationStore';

interface UseGlobalDirtyStateReturn {
  isDirty: boolean;
  dirtyFormIds: string[];
  resetAllDirtyState: () => void;
}

/**
 * Hook for the parent container to access the global dirty state.
 */
export function useGlobalDirtyState(): UseGlobalDirtyStateReturn {
  const dirtyForms = useFormCoordinationStore((state) => state.dirtyForms);
  const resetAllDirtyState = useFormCoordinationStore((state) => state.resetAllDirtyState);

  return {
    isDirty: dirtyForms.size > 0,
    dirtyFormIds: Array.from(dirtyForms),
    resetAllDirtyState,
  };
}
