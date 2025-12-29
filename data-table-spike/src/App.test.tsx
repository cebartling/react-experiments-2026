import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import App from './App';

describe('App', () => {
  it('renders the heading', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /vite \+ react/i })).toBeInTheDocument();
  });

  it('renders the Vite logo with link', () => {
    render(<App />);

    const viteLink = screen.getByRole('link', { name: /vite logo/i });
    expect(viteLink).toHaveAttribute('href', 'https://vite.dev');
    expect(viteLink).toHaveAttribute('target', '_blank');
  });

  it('renders the React logo with link', () => {
    render(<App />);

    const reactLink = screen.getByRole('link', { name: /react logo/i });
    expect(reactLink).toHaveAttribute('href', 'https://react.dev');
    expect(reactLink).toHaveAttribute('target', '_blank');
  });

  it('renders the counter button with initial count of 0', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /count is 0/i })).toBeInTheDocument();
  });

  it('increments the counter when button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const button = screen.getByRole('button', { name: /count is 0/i });
    await user.click(button);

    expect(screen.getByRole('button', { name: /count is 1/i })).toBeInTheDocument();
  });

  it('increments the counter multiple times', async () => {
    const user = userEvent.setup();
    render(<App />);

    const button = screen.getByRole('button', { name: /count is 0/i });
    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(screen.getByRole('button', { name: /count is 3/i })).toBeInTheDocument();
  });

  it('renders the HMR instruction text', () => {
    render(<App />);

    expect(screen.getByText(/edit/i)).toBeInTheDocument();
    expect(screen.getByText('src/App.tsx')).toBeInTheDocument();
  });

  it('renders the documentation link instruction', () => {
    render(<App />);

    expect(
      screen.getByText(/click on the vite and react logos to learn more/i)
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<App />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
