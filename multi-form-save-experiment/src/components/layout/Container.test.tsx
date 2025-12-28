import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from './Container';

describe('Container', () => {
  it('renders children correctly', () => {
    render(
      <Container>
        <div>Test content</div>
      </Container>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(
      <Container>
        <div>Content</div>
      </Container>
    );

    const container = screen.getByText('Content').parentElement;
    expect(container).toHaveClass('mx-auto');
    expect(container).toHaveClass('max-w-3xl');
    expect(container).toHaveClass('px-4');
  });

  it('applies additional className when provided', () => {
    render(
      <Container className="custom-class">
        <div>Content</div>
      </Container>
    );

    const container = screen.getByText('Content').parentElement;
    expect(container).toHaveClass('custom-class');
    expect(container).toHaveClass('mx-auto');
  });
});
