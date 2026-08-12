import { render, screen } from '@testing-library/react';
import { App } from './App';

it('renders an idle input-layer shell', () => {
  render(<App />);
  expect(screen.getByRole('status')).toHaveTextContent('就绪');
  expect(screen.getByText('InputMore')).toBeInTheDocument();
  expect(screen.getByText('Ctrl + Shift + Space 开始优化转写')).toBeInTheDocument();
});
