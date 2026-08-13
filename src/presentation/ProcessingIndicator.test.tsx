import { render, screen } from '@testing-library/react';
import { ProcessingIndicator } from './ProcessingIndicator';

it('shows an accessible processing label and animated dots', () => {
  render(<ProcessingIndicator />);
  expect(screen.getByLabelText('正在处理，请稍候')).toBeInTheDocument();
  expect(screen.getByTestId('processing-dots').children).toHaveLength(3);
});
