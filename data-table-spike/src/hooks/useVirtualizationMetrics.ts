import { useEffect, useRef, useState } from 'react';

/**
 * Metrics for virtualization performance monitoring.
 */
export interface VirtualizationMetrics {
  /** Frames per second during scroll */
  fps: number;
  /** Number of rendered rows */
  renderedRows: number;
  /** Total rows in dataset */
  totalRows: number;
  /** Percentage of rows being rendered */
  renderRatio: number;
  /** Average render time in ms */
  avgRenderTime: number;
}

/**
 * Hook for monitoring virtualization performance.
 *
 * Tracks FPS, render ratio, and average render time to help
 * diagnose performance issues with virtualized tables.
 *
 * @param renderedRows - Number of rows currently rendered
 * @param totalRows - Total number of rows in the dataset
 * @returns Metrics object with performance data
 *
 * @example
 * ```tsx
 * const metrics = useVirtualizationMetrics(visibleRows.length, totalRows);
 * console.log(`FPS: ${metrics.fps}, Render ratio: ${metrics.renderRatio}%`);
 * ```
 */
export function useVirtualizationMetrics(
  renderedRows: number,
  totalRows: number
): VirtualizationMetrics {
  const [fps, setFps] = useState(60);
  const [avgRenderTime, setAvgRenderTime] = useState(0);
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef(performance.now());
  const renderTimesRef = useRef<number[]>([]);

  // Track frame rate
  useEffect(() => {
    let animationFrameId: number;
    let isRunning = true;

    const measureFrame = () => {
      if (!isRunning) return;

      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      // Keep last 60 frame times - limit before adding
      if (frameTimesRef.current.length >= 60) {
        frameTimesRef.current.shift();
      }

      frameTimesRef.current.push(delta);

      // Calculate FPS every 30 frames
      if (frameTimesRef.current.length % 30 === 0) {
        const avgFrameTime =
          frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        setFps(Math.round(1000 / avgFrameTime));
      }

      animationFrameId = requestAnimationFrame(measureFrame);
    };

    animationFrameId = requestAnimationFrame(measureFrame);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Track render time when rendered rows change
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const renderTime = performance.now() - startTime;

      // Keep last 100 render times - limit before adding
      if (renderTimesRef.current.length >= 100) {
        renderTimesRef.current.shift();
      }

      renderTimesRef.current.push(renderTime);

      const avg = renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length;
      setAvgRenderTime(Math.round(avg * 100) / 100);
    };
  }, [renderedRows]);

  const renderRatio = totalRows > 0 ? Math.round((renderedRows / totalRows) * 100) : 0;

  return {
    fps,
    renderedRows,
    totalRows,
    renderRatio,
    avgRenderTime,
  };
}
