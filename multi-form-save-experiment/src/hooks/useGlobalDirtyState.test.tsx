import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGlobalDirtyState } from './useGlobalDirtyState';
import { useFormCoordinationStore } from '../stores/formCoordinationStore';

describe('useGlobalDirtyState', () => {
  beforeEach(() => {
    useFormCoordinationStore.getState().resetAllDirtyState();
  });

  describe('isDirty', () => {
    it('returns false when no forms are dirty', () => {
      const { result } = renderHook(() => useGlobalDirtyState());

      expect(result.current.isDirty).toBe(false);
    });

    it('returns true when at least one form is dirty', () => {
      const { markFormDirty } = useFormCoordinationStore.getState();

      const { result } = renderHook(() => useGlobalDirtyState());

      act(() => {
        markFormDirty('form-1');
      });

      expect(result.current.isDirty).toBe(true);
    });

    it('updates when forms become dirty or clean', () => {
      const { markFormDirty, markFormClean } = useFormCoordinationStore.getState();

      const { result } = renderHook(() => useGlobalDirtyState());

      expect(result.current.isDirty).toBe(false);

      act(() => {
        markFormDirty('form-1');
      });
      expect(result.current.isDirty).toBe(true);

      act(() => {
        markFormClean('form-1');
      });
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('dirtyFormIds', () => {
    it('returns empty array when no forms are dirty', () => {
      const { result } = renderHook(() => useGlobalDirtyState());

      expect(result.current.dirtyFormIds).toEqual([]);
    });

    it('returns array of dirty form IDs', () => {
      const { markFormDirty } = useFormCoordinationStore.getState();

      const { result } = renderHook(() => useGlobalDirtyState());

      act(() => {
        markFormDirty('form-1');
        markFormDirty('form-2');
      });

      expect(result.current.dirtyFormIds).toContain('form-1');
      expect(result.current.dirtyFormIds).toContain('form-2');
      expect(result.current.dirtyFormIds).toHaveLength(2);
    });

    it('updates when forms are added or removed', () => {
      const { markFormDirty, markFormClean } = useFormCoordinationStore.getState();

      const { result } = renderHook(() => useGlobalDirtyState());

      act(() => {
        markFormDirty('form-1');
      });
      expect(result.current.dirtyFormIds).toEqual(['form-1']);

      act(() => {
        markFormDirty('form-2');
      });
      expect(result.current.dirtyFormIds).toContain('form-1');
      expect(result.current.dirtyFormIds).toContain('form-2');

      act(() => {
        markFormClean('form-1');
      });
      expect(result.current.dirtyFormIds).toEqual(['form-2']);
    });
  });

  describe('resetAllDirtyState', () => {
    it('clears all dirty forms when called', () => {
      const { markFormDirty } = useFormCoordinationStore.getState();

      markFormDirty('form-1');
      markFormDirty('form-2');
      markFormDirty('form-3');

      const { result } = renderHook(() => useGlobalDirtyState());

      expect(result.current.isDirty).toBe(true);
      expect(result.current.dirtyFormIds).toHaveLength(3);

      act(() => {
        result.current.resetAllDirtyState();
      });

      expect(result.current.isDirty).toBe(false);
      expect(result.current.dirtyFormIds).toEqual([]);
    });
  });
});
