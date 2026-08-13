import { render, screen } from '@testing-library/react';
import { App } from './App';

it('renders an idle input-layer shell', () => {
  render(<App />);
  expect(screen.getByRole('status')).toHaveTextContent('READY');
  expect(screen.getByText('InputMore')).toBeInTheDocument();
});

it('uses the compact capsule shell with a theme-aware state marker', () => {
  render(<App />);
  expect(screen.getByTestId('capsule')).toHaveAttribute('data-state', 'idle');
  expect(screen.getByTestId('capsule')).toHaveAttribute('data-theme', 'dark');
});
