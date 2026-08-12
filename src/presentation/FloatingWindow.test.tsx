import { render, screen } from '@testing-library/react';
import { FloatingWindow } from './FloatingWindow';
import type { SessionState } from '../domain/actions';

const renderState = (state: SessionState) => render(<FloatingWindow state={state} onCancel={() => {}} onRetry={() => {}} onInsertAnswer={() => {}} onUndo={() => {}} />);

it('shows recording feedback and stop guidance', () => {
  renderState({ tag: 'recording', action: 'enhance', startedAt: Date.now() });
  expect(screen.getByRole('status')).toHaveTextContent('正在录音');
  expect(screen.getByText('再次按键结束')).toBeInTheDocument();
});

it('shows a cancellable processing state', () => {
  renderState({ tag: 'processing', action: 'translate', requestId: 'r1' });
  expect(screen.getByRole('status')).toHaveTextContent('正在处理');
  expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument();
});

it('shows Ask answers with an insert action', () => {
  renderState({ tag: 'showingAnswer', text: '答案内容', requestId: 'r2' });
  expect(screen.getByText('答案内容')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '插入答案' })).toBeInTheDocument();
});

it('shows retry and cancel actions for errors', () => {
  renderState({ tag: 'error', action: 'enhance', message: '网络异常', retryable: true });
  expect(screen.getByText('网络异常')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '重试' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument();
});
