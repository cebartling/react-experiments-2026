import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader } from './Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    );

    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default styling classes', () => {
    render(
      <Card>
        <div>Content</div>
      </Card>
    );

    const card = screen.getByText('Content').parentElement;
    expect(card).toHaveClass('rounded-xl');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('p-6');
    expect(card).toHaveClass('shadow-card');
  });

  it('renders as div by default', () => {
    const { container } = render(
      <Card>
        <span>Content</span>
      </Card>
    );

    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('renders as section when specified', () => {
    const { container } = render(
      <Card as="section">
        <span>Content</span>
      </Card>
    );

    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('renders as article when specified', () => {
    const { container } = render(
      <Card as="article">
        <span>Content</span>
      </Card>
    );

    expect(container.querySelector('article')).toBeInTheDocument();
  });

  it('applies additional className when provided', () => {
    render(
      <Card className="custom-class">
        <div>Content</div>
      </Card>
    );

    const card = screen.getByText('Content').parentElement;
    expect(card).toHaveClass('custom-class');
  });
});

describe('CardHeader', () => {
  it('renders title correctly', () => {
    render(<CardHeader title="Test Title" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Title');
  });

  it('renders description when provided', () => {
    render(<CardHeader title="Title" description="Test description" />);

    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(<CardHeader title="Title" />);

    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(<CardHeader title="Title" actions={<button type="button">Action</button>} />);

    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
});
