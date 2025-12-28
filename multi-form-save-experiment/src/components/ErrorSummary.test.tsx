import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorSummary } from './ErrorSummary';
import type { FormValidationError, FormSubmissionError } from '../types/errors';

describe('ErrorSummary', () => {
  const mockValidationErrors: FormValidationError[] = [
    {
      type: 'validation',
      formId: 'userInfo',
      formName: 'User Information',
      message: 'Validation failed',
      timestamp: new Date(),
      fieldErrors: [
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Invalid email format' },
      ],
    },
  ];

  const mockSubmissionErrors: FormSubmissionError[] = [
    {
      type: 'submission',
      formId: 'address',
      formName: 'Address',
      message: 'Server error occurred',
      timestamp: new Date(),
      retryable: true,
    },
  ];

  it('renders nothing when there are no errors', () => {
    const { container } = render(<ErrorSummary validationErrors={[]} submissionErrors={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders validation errors section when validation errors exist', () => {
    render(<ErrorSummary validationErrors={mockValidationErrors} submissionErrors={[]} />);

    expect(screen.getByText('Validation Errors')).toBeInTheDocument();
    expect(screen.getByText('User Information:')).toBeInTheDocument();
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
  });

  it('renders submission errors section when submission errors exist', () => {
    render(<ErrorSummary validationErrors={[]} submissionErrors={mockSubmissionErrors} />);

    expect(screen.getByText('Submission Errors')).toBeInTheDocument();
    expect(screen.getByText('Address:')).toBeInTheDocument();
    expect(screen.getByText(/Server error occurred/)).toBeInTheDocument();
  });

  it('renders both sections when both error types exist', () => {
    render(
      <ErrorSummary
        validationErrors={mockValidationErrors}
        submissionErrors={mockSubmissionErrors}
      />
    );

    expect(screen.getByText('Validation Errors')).toBeInTheDocument();
    expect(screen.getByText('Submission Errors')).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<ErrorSummary validationErrors={mockValidationErrors} submissionErrors={[]} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveAttribute('aria-labelledby', 'error-summary-title');
  });

  it('displays the error summary title', () => {
    render(<ErrorSummary validationErrors={mockValidationErrors} submissionErrors={[]} />);

    expect(screen.getByText('Please fix the following errors before saving:')).toBeInTheDocument();
  });

  it('renders dismiss button when onDismiss is provided', () => {
    const onDismiss = vi.fn();
    render(
      <ErrorSummary
        validationErrors={mockValidationErrors}
        submissionErrors={[]}
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByRole('button', { name: 'Dismiss errors' })).toBeInTheDocument();
  });

  it('does not render dismiss button when onDismiss is not provided', () => {
    render(<ErrorSummary validationErrors={mockValidationErrors} submissionErrors={[]} />);

    expect(screen.queryByRole('button', { name: 'Dismiss errors' })).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(
      <ErrorSummary
        validationErrors={mockValidationErrors}
        submissionErrors={[]}
        onDismiss={onDismiss}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss errors' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('groups field errors by form correctly', () => {
    const multiFormErrors: FormValidationError[] = [
      {
        type: 'validation',
        formId: 'form1',
        formName: 'Form One',
        message: 'Validation failed',
        timestamp: new Date(),
        fieldErrors: [{ field: 'field1', message: 'Error 1' }],
      },
      {
        type: 'validation',
        formId: 'form2',
        formName: 'Form Two',
        message: 'Validation failed',
        timestamp: new Date(),
        fieldErrors: [{ field: 'field2', message: 'Error 2' }],
      },
    ];

    render(<ErrorSummary validationErrors={multiFormErrors} submissionErrors={[]} />);

    expect(screen.getByText('Form One:')).toBeInTheDocument();
    expect(screen.getByText('Form Two:')).toBeInTheDocument();
    expect(screen.getByText('Error 1')).toBeInTheDocument();
    expect(screen.getByText('Error 2')).toBeInTheDocument();
  });
});
