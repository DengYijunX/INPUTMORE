import { render, screen } from '@testing-library/react';
import { App } from './App';

it('renders an idle input-layer shell', () => {
  render(<App />);
  expect(screen.getByRole('status')).toHaveTextContent('READY');
  expect(screen.queryByText('InputMore')).not.toBeInTheDocument();
  expect(screen.queryByText('♩')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '文本转写' })).toHaveAccessibleName('文本转写');
  expect(screen.getByRole('button', { name: '翻译' })).toHaveAccessibleName('翻译');
  expect(screen.getByRole('button', { name: '网页检索' })).toHaveAccessibleName('网页检索');
});

it('uses the compact capsule shell with a theme-aware state marker', () => {
  render(<App />);
  expect(screen.getByTestId('capsule')).toHaveAttribute('data-state', 'idle');
  expect(screen.getByTestId('capsule')).toHaveAttribute('data-theme', 'dark');
});

it('exposes a translation entry from the idle capsule', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: '翻译' })).toBeInTheDocument();
});
