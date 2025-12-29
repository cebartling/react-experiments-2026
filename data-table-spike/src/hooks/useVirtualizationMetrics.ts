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
  /** Callback to be used with React Profiler onRender */
  onRenderCallback: (
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => void;
}

/**
 * Hook for monitoring virtualization performance.
 *
 * Tracks FPS, render ratio, and average render time to help
 * diagnose performance issues with virtualized tables.
 *
 * Uses React's Profiler API to accurately measure render times.
 * The returned `onRenderCallback` should be passed to a React Profiler
 * component wrapping the component you want to measure.
 *
 * @param renderedRows - Number of rows currently rendered
 * @param totalRows - Total number of rows in the dataset
 * @returns Metrics object with performance data and onRenderCallback
 *
 * @example
 * ```tsx
 * const metrics = useVirtualizationMetrics(visibleRows.length, totalRows);
 * 
 * return (
 *   <Profiler id="table-body" onRender={metrics.onRenderCallback}>
 *     <TableBody />
 *   </Profiler>
 * );
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

      frameTimesRef.current.push(delta);

      // Keep last 60 frame times
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

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

  // Profiler callback for measuring actual render time
  const onRenderCallback = useRef(
    (
      _id: string,
      _phase: 'mount' | 'update',
      actualDuration: number
    ) => {
      renderTimesRef.current.push(actualDuration);

      // Keep last 100 render times
      if (renderTimesRef.current.length > 100) {
        renderTimesRef.current.shift();
      }

      const avg =
        renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length;
      setAvgRenderTime(Math.round(avg * 100) / 100);
    }
  ).current;

  const renderRatio = totalRows > 0 ? Math.round((renderedRows / totalRows) * 100) : 0;

  return {
    fps,
    renderedRows,
    totalRows,
    renderRatio,
    avgRenderTime,
    onRenderCallback,
  };
}
