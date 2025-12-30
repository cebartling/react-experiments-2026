import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PerformanceOverlay } from '../PerformanceOverlay';
import type { VirtualizationMetrics } from '../../../hooks/useVirtualizationMetrics';

const mockMetrics: VirtualizationMetrics = {
  fps: 60,
  renderedRows: 20,
  totalRows: 1000,
  renderRatio: 2,
  avgRenderTime: 5.5,
};

describe('PerformanceOverlay', () => {
  it('should not render when visible is false', () => {
    render(<PerformanceOverlay metrics={mockMetrics} visible={false} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should not render by default (visible defaults to false)', () => {
    render(<PerformanceOverlay metrics={mockMetrics} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should render when visible is true', () => {
    render(<PerformanceOverlay metrics={mockMetrics} visible={true} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should display FPS metric', () => {
    render(<PerformanceOverlay metrics={mockMetrics} visible={true} />);

    expect(screen.getByText('FPS:')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
  });

  it('should display rendered rows metric', () => {
    render(<PerformanceOverlay metrics={mockMetrics} visible={true} />);

    expect(screen.getByText('Rendered:')).toBeInTheDocument();
    expect(screen.getByText('20 / 1000')).toBeInTheDocument();
  });

  it('should display render ratio metric', () => {
    render(<PerformanceOverlay metrics={mockMetrics} visible={true} />);

    expect(screen.getByText('Ratio:')).toBeInTheDocument();
    expect(screen.getByText('2%')).toBeInTheDocument();
  });

  it('should display average render time metric', () => {
    render(<PerformanceOverlay metrics={mockMetrics} visible={true} />);

    expect(screen.getByText('Render:')).toBeInTheDocument();
    expect(screen.getByText('5.5ms')).toBeInTheDocument();
  });

  it('should have performance-overlay class', () => {
    render(<PerformanceOverlay metrics={mockMetrics} visible={true} />);

    expect(document.querySelector('.performance-overlay')).toBeInTheDocument();
  });

  it('should show green color for FPS >= 55', () => {
    render(<PerformanceOverlay metrics={{ ...mockMetrics, fps: 60 }} visible={true} />);

    const fpsValue = screen.getByText('60');
    expect(fpsValue).toHaveStyle({ color: '#059669' });
  });

  it('should show yellow color for FPS >= 30 and < 55', () => {
    render(<PerformanceOverlay metrics={{ ...mockMetrics, fps: 45 }} visible={true} />);

    const fpsValue = screen.getByText('45');
    expect(fpsValue).toHaveStyle({ color: '#d97706' });
  });

  it('should show red color for FPS < 30', () => {
    render(<PerformanceOverlay metrics={{ ...mockMetrics, fps: 20 }} visible={true} />);

    const fpsValue = screen.getByText('20');
    expect(fpsValue).toHaveStyle({ color: '#dc2626' });
  });

  it('should have accessible label', () => {
    render(<PerformanceOverlay metrics={mockMetrics} visible={true} />);

    expect(screen.getByLabelText('Performance metrics')).toBeInTheDocument();
  });
});
