import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
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

    expect(result.current).toEqual({
      fps: 60,
      renderedRows: 20,
      totalRows: 1000,
      renderRatio: 2,
      avgRenderTime: 0,
    });
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
  });

  it('should cleanup animation frame on unmount', () => {
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
    const { unmount } = renderHook(() => useVirtualizationMetrics(20, 1000));

    unmount();

    expect(cancelSpy).toHaveBeenCalled();
    cancelSpy.mockRestore();
  });
});
