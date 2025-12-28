import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField, Input, Select, Checkbox } from './FormField';

describe('FormField', () => {
  it('renders label correctly', () => {
    render(
      <FormField label="Test Label" htmlFor="test-input">
        <input id="test-input" />
      </FormField>
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('shows required indicator when required is true', () => {
    render(
      <FormField label="Required Field" htmlFor="test-input" required>
        <input id="test-input" />
      </FormField>
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('does not show required indicator when required is false', () => {
    render(
      <FormField label="Optional Field" htmlFor="test-input">
        <input id="test-input" />
      </FormField>
    );

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('renders hint when provided', () => {
    render(
      <FormField label="Field" htmlFor="test-input" hint="Helpful hint">
        <input id="test-input" />
      </FormField>
    );

    expect(screen.getByText('Helpful hint')).toBeInTheDocument();
  });

  it('displays error message when error is provided', () => {
    render(
      <FormField
        label="Field"
        htmlFor="test-input"
        error={{ type: 'required', message: 'This field is required' }}
      >
        <input id="test-input" />
      </FormField>
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
  });

  it('does not display error when error is not provided', () => {
    render(
      <FormField label="Field" htmlFor="test-input">
        <input id="test-input" />
      </FormField>
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('Input', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />);

    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('applies error styling when hasError is true', () => {
    render(<Input hasError data-testid="input" />);

    const input = screen.getByTestId('input');
    expect(input).toHaveClass('border-red-300');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies normal styling when hasError is false', () => {
    render(<Input data-testid="input" />);

    const input = screen.getByTestId('input');
    expect(input).toHaveClass('border-surface-300');
  });

  it('passes through additional props', () => {
    render(<Input type="email" data-testid="input" disabled />);

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toBeDisabled();
  });

  it('applies additional className', () => {
    render(<Input className="custom-class" data-testid="input" />);

    const input = screen.getByTestId('input');
    expect(input).toHaveClass('custom-class');
  });
});

describe('Select', () => {
  const options = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
    { value: 'c', label: 'Option C' },
  ];

  it('renders all options', () => {
    render(<Select options={options} data-testid="select" />);

    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('applies error styling when hasError is true', () => {
    render(<Select options={options} hasError data-testid="select" />);

    const select = screen.getByTestId('select');
    expect(select).toHaveClass('border-red-300');
    expect(select).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies normal styling when hasError is false', () => {
    render(<Select options={options} data-testid="select" />);

    const select = screen.getByTestId('select');
    expect(select).toHaveClass('border-surface-300');
  });

  it('passes through additional props', () => {
    render(<Select options={options} data-testid="select" disabled />);

    const select = screen.getByTestId('select');
    expect(select).toBeDisabled();
  });
});

describe('Checkbox', () => {
  it('renders with label', () => {
    render(<Checkbox label="Accept terms" />);

    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    render(<Checkbox label="Terms" disabled checked />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
    expect(checkbox).toBeChecked();
  });

  it('applies additional className', () => {
    render(<Checkbox label="Terms" className="custom-class" />);

    const label = screen.getByText('Terms').closest('label');
    expect(label).toHaveClass('custom-class');
  });
});
