import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SaveButton } from './SaveButton';
import { useFormCoordinationStore } from '../stores/formCoordinationStore';

vi.mock('../stores/formCoordinationStore', () => ({
  useFormCoordinationStore: vi.fn(),
}));

const mockUseFormCoordinationStore = vi.mocked(useFormCoordinationStore);

interface MockState {
  dirtyForms: Set<string>;
  isValidating: boolean;
  submissionStatus: 'idle' | 'submitting' | 'success' | 'error';
}

function createMockSelector(state: MockState) {
  return (selector: (s: unknown) => unknown) => selector(state);
}

describe('SaveButton', () => {
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSave.mockResolvedValue(undefined);
  });

  it('displays "Save All Changes" when idle', () => {
    mockUseFormCoordinationStore.mockImplementation(
      createMockSelector({
        dirtyForms: new Set(['form1']),
        isValidating: false,
        submissionStatus: 'idle',
      }) as typeof useFormCoordinationStore
    );

    render(<SaveButton onSave={mockOnSave} />);

    expect(screen.getByRole('button')).toHaveTextContent('Save All Changes');
  });

  it('is disabled when no forms are dirty', () => {
    mockUseFormCoordinationStore.mockImplementation(
      createMockSelector({
        dirtyForms: new Set(),
        isValidating: false,
        submissionStatus: 'idle',
      }) as typeof useFormCoordinationStore
    );

    render(<SaveButton onSave={mockOnSave} />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is enabled when forms are dirty', () => {
    mockUseFormCoordinationStore.mockImplementation(
      createMockSelector({
        dirtyForms: new Set(['form1']),
        isValidating: false,
        submissionStatus: 'idle',
      }) as typeof useFormCoordinationStore
    );

    render(<SaveButton onSave={mockOnSave} />);

    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('shows "Validating..." when isValidating is true', () => {
    mockUseFormCoordinationStore.mockImplementation(
      createMockSelector({
        dirtyForms: new Set(['form1']),
        isValidating: true,
        submissionStatus: 'idle',
      }) as typeof useFormCoordinationStore
    );

    render(<SaveButton onSave={mockOnSave} />);

    expect(screen.getByRole('button')).toHaveTextContent('Validating...');
  });

  it('shows "Saving..." when submissionStatus is submitting', () => {
    mockUseFormCoordinationStore.mockImplementation(
      createMockSelector({
        dirtyForms: new Set(['form1']),
        isValidating: false,
        submissionStatus: 'submitting',
      }) as typeof useFormCoordinationStore
    );

    render(<SaveButton onSave={mockOnSave} />);

    expect(screen.getByRole('button')).toHaveTextContent('Saving...');
  });

  it('is disabled during validation', () => {
    mockUseFormCoordinationStore.mockImplementation(
      createMockSelector({
        dirtyForms: new Set(['form1']),
        isValidating: true,
        submissionStatus: 'idle',
      }) as typeof useFormCoordinationStore
    );

    render(<SaveButton onSave={mockOnSave} />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled during submission', () => {
    mockUseFormCoordinationStore.mockImplementation(
      createMockSelector({
        dirtyForms: new Set(['form1']),
        isValidating: false,
        submissionStatus: 'submitting',
      }) as typeof useFormCoordinationStore
    );

    render(<SaveButton onSave={mockOnSave} />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onSave when clicked', () => {
    mockUseFormCoordinationStore.mockImplementation(
      createMockSelector({
        dirtyForms: new Set(['form1']),
        isValidating: false,
        submissionStatus: 'idle',
      }) as typeof useFormCoordinationStore
    );

    render(<SaveButton onSave={mockOnSave} />);

    fireEvent.click(screen.getByRole('button'));

    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });

  it('has aria-busy attribute when processing', () => {
    mockUseFormCoordinationStore.mockImplementation(
      createMockSelector({
        dirtyForms: new Set(['form1']),
        isValidating: true,
        submissionStatus: 'idle',
      }) as typeof useFormCoordinationStore
    );

    render(<SaveButton onSave={mockOnSave} />);

    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('shows spinner when processing', () => {
    mockUseFormCoordinationStore.mockImplementation(
      createMockSelector({
        dirtyForms: new Set(['form1']),
        isValidating: true,
        submissionStatus: 'idle',
      }) as typeof useFormCoordinationStore
    );

    const { container } = render(<SaveButton onSave={mockOnSave} />);

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('does not show spinner when not processing', () => {
    mockUseFormCoordinationStore.mockImplementation(
      createMockSelector({
        dirtyForms: new Set(['form1']),
        isValidating: false,
        submissionStatus: 'idle',
      }) as typeof useFormCoordinationStore
    );

    const { container } = render(<SaveButton onSave={mockOnSave} />);

    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });
});
