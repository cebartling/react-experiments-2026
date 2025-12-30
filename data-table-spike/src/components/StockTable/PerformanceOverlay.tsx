import type { VirtualizationMetrics } from '../../hooks/useVirtualizationMetrics';

/**
 * Props for the PerformanceOverlay component.
 */
interface PerformanceOverlayProps {
  /** Virtualization metrics to display */
  metrics: VirtualizationMetrics;
  /** Whether the overlay should be visible. Defaults to false. */
  visible?: boolean;
}

/**
 * Debug overlay showing virtualization performance metrics.
 *
 * Displays FPS, rendered rows, render ratio, and average render time
 * to help diagnose performance issues during development.
 *
 * @example
 * ```tsx
 * import { Profiler } from 'react';
 * 
 * const metrics = useVirtualizationMetrics(renderedRows, totalRows);
 * 
 * return (
 *   <Profiler id="table-body" onRender={metrics.onRenderCallback}>
 *     <TableBody />
 *     <PerformanceOverlay metrics={metrics} visible={isDevelopment} />
 *   </Profiler>
 * );
 * ```
 */
export function PerformanceOverlay({ metrics, visible = false }: PerformanceOverlayProps) {
  if (!visible) return null;

  const fpsColor = metrics.fps >= 55 ? '#059669' : metrics.fps >= 30 ? '#d97706' : '#dc2626';

  return (
    <div className="performance-overlay" role="status" aria-label="Performance metrics">
      <div className="metric">
        <span className="label">FPS:</span>
        <span className="value" style={{ color: fpsColor }}>
          {metrics.fps}
        </span>
      </div>
      <div className="metric">
        <span className="label">Rendered:</span>
        <span className="value">
          {metrics.renderedRows} / {metrics.totalRows}
        </span>
      </div>
      <div className="metric">
        <span className="label">Ratio:</span>
        <span className="value">{metrics.renderRatio}%</span>
      </div>
      <div className="metric">
        <span className="label">Render:</span>
        <span className="value">{metrics.avgRenderTime}ms</span>
      </div>
    </div>
  );
}
