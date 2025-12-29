import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  const mockError = new Error('Network connection failed');

  it('should render with role alert', () => {
    render(<ErrorState error={mockError} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should display error title', () => {
    render(<ErrorState error={mockError} />);
    expect(screen.getByText('Failed to load stock data')).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(<ErrorState error={mockError} />);
    expect(screen.getByText('Network connection failed')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    render(<ErrorState error={mockError} onRetry={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
  });

  it('should not render retry button when onRetry is not provided', () => {
    render(<ErrorState error={mockError} />);
    expect(screen.queryByRole('button', { name: 'Try Again' })).not.toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorState error={mockError} onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: 'Try Again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should display different error messages', () => {
    const customError = new Error('API rate limit exceeded');
    render(<ErrorState error={customError} />);
    expect(screen.getByText('API rate limit exceeded')).toBeInTheDocument();
  });
});
