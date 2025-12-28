import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDirtyTracking } from './useDirtyTracking';
import { useFormCoordinationStore } from '../stores/formCoordinationStore';

describe('useDirtyTracking', () => {
  beforeEach(() => {
    // Reset store state before each test
    useFormCoordinationStore.getState().resetAllDirtyState();
  });

  describe('reportDirtyState', () => {
    it('marks form as dirty when called with true', () => {
      const { result } = renderHook(() => useDirtyTracking({ formId: 'test-form' }));

      act(() => {
        result.current.reportDirtyState(true);
      });

      const state = useFormCoordinationStore.getState();
      expect(state.dirtyForms.has('test-form')).toBe(true);
    });

    it('marks form as clean when called with false', () => {
      const { result } = renderHook(() => useDirtyTracking({ formId: 'test-form' }));

      act(() => {
        result.current.reportDirtyState(true);
        result.current.reportDirtyState(false);
      });

      const state = useFormCoordinationStore.getState();
      expect(state.dirtyForms.has('test-form')).toBe(false);
    });

    it('correctly handles toggling dirty state', () => {
      const { result } = renderHook(() => useDirtyTracking({ formId: 'test-form' }));

      act(() => {
        result.current.reportDirtyState(true);
      });
      expect(useFormCoordinationStore.getState().dirtyForms.has('test-form')).toBe(true);

      act(() => {
        result.current.reportDirtyState(false);
      });
      expect(useFormCoordinationStore.getState().dirtyForms.has('test-form')).toBe(false);

      act(() => {
        result.current.reportDirtyState(true);
      });
      expect(useFormCoordinationStore.getState().dirtyForms.has('test-form')).toBe(true);
    });
  });

  describe('cleanup on unmount', () => {
    it('removes form from dirty set when component unmounts', () => {
      const { result, unmount } = renderHook(() => useDirtyTracking({ formId: 'test-form' }));

      act(() => {
        result.current.reportDirtyState(true);
      });

      expect(useFormCoordinationStore.getState().dirtyForms.has('test-form')).toBe(true);

      unmount();

      expect(useFormCoordinationStore.getState().dirtyForms.has('test-form')).toBe(false);
    });

    it('cleanup does not affect other forms', () => {
      const { result: result1, unmount: unmount1 } = renderHook(() =>
        useDirtyTracking({ formId: 'form-1' })
      );
      const { result: result2 } = renderHook(() => useDirtyTracking({ formId: 'form-2' }));

      act(() => {
        result1.current.reportDirtyState(true);
        result2.current.reportDirtyState(true);
      });

      expect(useFormCoordinationStore.getState().dirtyForms.size).toBe(2);

      unmount1();

      const state = useFormCoordinationStore.getState();
      expect(state.dirtyForms.has('form-1')).toBe(false);
      expect(state.dirtyForms.has('form-2')).toBe(true);
      expect(state.dirtyForms.size).toBe(1);
    });
  });

  describe('multiple forms', () => {
    it('tracks multiple forms independently', () => {
      const { result: result1 } = renderHook(() => useDirtyTracking({ formId: 'form-1' }));
      // Create second hook to ensure it registers in the store
      renderHook(() => useDirtyTracking({ formId: 'form-2' }));

      act(() => {
        result1.current.reportDirtyState(true);
      });

      const state = useFormCoordinationStore.getState();
      expect(state.dirtyForms.has('form-1')).toBe(true);
      expect(state.dirtyForms.has('form-2')).toBe(false);
    });
  });
});
