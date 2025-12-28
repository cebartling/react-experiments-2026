import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormErrorBoundary } from './FormErrorBoundary';

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Normal content</div>;
}

describe('FormErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error occurs', () => {
    render(
      <FormErrorBoundary>
        <div>Child content</div>
      </FormErrorBoundary>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders default fallback UI when an error occurs', () => {
    render(
      <FormErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </FormErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText('An error occurred while rendering this form section.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
  });

  it('displays error message in details section', () => {
    render(
      <FormErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </FormErrorBoundary>
    );

    expect(screen.getByText('Error details')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error UI</div>;

    render(
      <FormErrorBoundary fallback={customFallback}>
        <ThrowingComponent shouldThrow={true} />
      </FormErrorBoundary>
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('calls onError callback when an error occurs', () => {
    const onError = vi.fn();

    render(
      <FormErrorBoundary onError={onError}>
        <ThrowingComponent shouldThrow={true} />
      </FormErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error message' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('resets error state when Try Again is clicked', () => {
    const { rerender } = render(
      <FormErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </FormErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Rerender with non-throwing component before clicking retry
    rerender(
      <FormErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </FormErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));

    expect(screen.getByText('Normal content')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(
      <FormErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </FormErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('logs error to console', () => {
    render(
      <FormErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </FormErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'Form error boundary caught error:',
      expect.objectContaining({ message: 'Test error message' }),
      expect.any(Object)
    );
  });
});
