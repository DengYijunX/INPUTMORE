import { render, screen } from '@testing-library/react';
import { App } from './App';

it('renders an idle input-layer shell', () => {
  render(<App />);
  expect(screen.getByRole('status')).toHaveTextContent('就绪');
});
