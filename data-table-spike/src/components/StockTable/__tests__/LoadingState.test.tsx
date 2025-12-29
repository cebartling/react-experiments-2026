import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingState } from '../LoadingState';

describe('LoadingState', () => {
  it('should render with role status', () => {
    render(<LoadingState />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should have accessible label', () => {
    render(<LoadingState />);
    expect(screen.getByLabelText('Loading stock data')).toBeInTheDocument();
  });

  it('should render default 10 skeleton rows', () => {
    render(<LoadingState />);
    const tbody = screen.getByRole('status').querySelector('tbody');
    const rows = tbody?.querySelectorAll('tr');
    expect(rows).toHaveLength(10);
  });

  it('should render custom number of rows', () => {
    render(<LoadingState rowCount={5} />);
    const tbody = screen.getByRole('status').querySelector('tbody');
    const rows = tbody?.querySelectorAll('tr');
    expect(rows).toHaveLength(5);
  });

  it('should render default 7 columns', () => {
    render(<LoadingState />);
    const thead = screen.getByRole('status').querySelector('thead');
    const headerCells = thead?.querySelectorAll('th');
    expect(headerCells).toHaveLength(7);
  });

  it('should render custom number of columns', () => {
    render(<LoadingState columnCount={5} />);
    const thead = screen.getByRole('status').querySelector('thead');
    const headerCells = thead?.querySelectorAll('th');
    expect(headerCells).toHaveLength(5);
  });

  it('should render skeleton cells', () => {
    render(<LoadingState rowCount={1} columnCount={1} />);
    const skeletonCells = screen.getByRole('status').querySelectorAll('.skeleton-cell');
    expect(skeletonCells.length).toBeGreaterThan(0);
  });

  it('should have skeleton table class', () => {
    render(<LoadingState />);
    const table = screen.getByRole('status').querySelector('table');
    expect(table).toHaveClass('skeleton');
  });
});
