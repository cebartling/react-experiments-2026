import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchFilter } from '../SearchFilter';

describe('SearchFilter', () => {
  it('should render with placeholder text', () => {
    render(<SearchFilter value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Search stocks...')).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    render(<SearchFilter value="" onChange={vi.fn()} placeholder="Search by symbol..." />);
    expect(screen.getByPlaceholderText('Search by symbol...')).toBeInTheDocument();
  });

  it('should have accessible label', () => {
    render(<SearchFilter value="" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox', { name: 'Search stocks' })).toBeInTheDocument();
  });

  it('should display initial value', () => {
    render(<SearchFilter value="AAPL" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('AAPL')).toBeInTheDocument();
  });

  it('should update local value on input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<SearchFilter value="" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'A');

    expect(input).toHaveValue('A');
  });

  it('should debounce onChange calls', async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();

    render(<SearchFilter value="" onChange={onChange} debounceMs={300} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'AAPL' } });

    expect(onChange).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(onChange).toHaveBeenCalledWith('AAPL');
    vi.useRealTimers();
  });

  it('should show clear button when value is present', () => {
    render(<SearchFilter value="AAPL" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
  });

  it('should not show clear button when value is empty', () => {
    render(<SearchFilter value="" onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  it('should clear input and call onChange when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<SearchFilter value="AAPL" onChange={onChange} />);

    const clearButton = screen.getByRole('button', { name: 'Clear search' });
    await user.click(clearButton);

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('should sync with external value changes', () => {
    const { rerender } = render(<SearchFilter value="" onChange={vi.fn()} />);

    expect(screen.getByRole('textbox')).toHaveValue('');

    rerender(<SearchFilter value="GOOGL" onChange={vi.fn()} />);

    expect(screen.getByRole('textbox')).toHaveValue('GOOGL');
  });

  it('should not call onChange if value has not changed after debounce', async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();

    render(<SearchFilter value="AAPL" onChange={onChange} />);

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(onChange).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
