import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVirtualizationMetrics } from '../useVirtualizationMetrics';

describe('useVirtualizationMetrics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial metrics', () => {
    const { result } = renderHook(() => useVirtualizationMetrics(20, 1000));

    expect(result.current.fps).toBe(60);
    expect(result.current.renderedRows).toBe(20);
    expect(result.current.totalRows).toBe(1000);
    expect(result.current.renderRatio).toBe(2);
    expect(result.current.avgRenderTime).toBe(0);
    expect(result.current.onRenderCallback).toBeInstanceOf(Function);
  });

  it('should calculate render ratio correctly', () => {
    const { result } = renderHook(() => useVirtualizationMetrics(50, 200));

    expect(result.current.renderRatio).toBe(25);
  });

  it('should handle zero total rows', () => {
    const { result } = renderHook(() => useVirtualizationMetrics(0, 0));

    expect(result.current.renderRatio).toBe(0);
  });

  it('should update rendered rows when prop changes', () => {
    const { result, rerender } = renderHook(
      ({ rendered, total }) => useVirtualizationMetrics(rendered, total),
      { initialProps: { rendered: 20, total: 1000 } }
    );

    expect(result.current.renderedRows).toBe(20);

    rerender({ rendered: 30, total: 1000 });

    expect(result.current.renderedRows).toBe(30);
  });

  it('should update total rows when prop changes', () => {
    const { result, rerender } = renderHook(
      ({ rendered, total }) => useVirtualizationMetrics(rendered, total),
      { initialProps: { rendered: 20, total: 1000 } }
    );

    expect(result.current.totalRows).toBe(1000);

    rerender({ rendered: 20, total: 2000 });

    expect(result.current.totalRows).toBe(2000);
  });

  it('should start with initial fps of 60', () => {
    const { result } = renderHook(() => useVirtualizationMetrics(20, 1000));

    expect(result.current.fps).toBe(60);
  });

  it('should start with initial avgRenderTime of 0', () => {
    const { result } = renderHook(() => useVirtualizationMetrics(20, 1000));

    expect(result.current.avgRenderTime).toBe(0);
  });

  it('should recalculate render ratio when values change', () => {
    const { result, rerender } = renderHook(
      ({ rendered, total }) => useVirtualizationMetrics(rendered, total),
      { initialProps: { rendered: 20, total: 1000 } }
    );

    expect(result.current.renderRatio).toBe(2);

    rerender({ rendered: 100, total: 1000 });

    expect(result.current.renderRatio).toBe(10);
  });

  it('should return metrics object with all required properties', () => {
    const { result } = renderHook(() => useVirtualizationMetrics(20, 1000));

    expect(result.current).toHaveProperty('fps');
    expect(result.current).toHaveProperty('renderedRows');
    expect(result.current).toHaveProperty('totalRows');
    expect(result.current).toHaveProperty('renderRatio');
    expect(result.current).toHaveProperty('avgRenderTime');
    expect(result.current).toHaveProperty('onRenderCallback');
  });

  it('should cleanup animation frame on unmount', () => {
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
    const { unmount } = renderHook(() => useVirtualizationMetrics(20, 1000));

    unmount();

    expect(cancelSpy).toHaveBeenCalled();
    cancelSpy.mockRestore();
  });

  it('should update avgRenderTime when onRenderCallback is called', () => {
    const { result } = renderHook(() => useVirtualizationMetrics(20, 1000));

    expect(result.current.avgRenderTime).toBe(0);

    // Simulate profiler callback with 5ms render time
    act(() => {
      result.current.onRenderCallback('test', 'mount', 5, 5, 0, 5);
    });

    expect(result.current.avgRenderTime).toBe(5);

    // Add another render time
    act(() => {
      result.current.onRenderCallback('test', 'update', 10, 5, 5, 15);
    });

    // Average of 5 and 10 is 7.5
    expect(result.current.avgRenderTime).toBe(7.5);
  });

  it('should maintain a rolling average of render times', () => {
    const { result } = renderHook(() => useVirtualizationMetrics(20, 1000));

    // Add 3 render times
    act(() => {
      result.current.onRenderCallback('test', 'update', 10, 10, 0, 10);
      result.current.onRenderCallback('test', 'update', 20, 10, 10, 30);
      result.current.onRenderCallback('test', 'update', 30, 10, 30, 60);
    });

    // Average should be (10 + 20 + 30) / 3 = 20
    expect(result.current.avgRenderTime).toBe(20);
  });
});
