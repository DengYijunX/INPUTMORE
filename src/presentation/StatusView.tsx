import type { SessionState } from '../domain/actions';

export function StatusView({ state, onCancel, onRetry, onInsertAnswer, onUndo }: {
  state: SessionState;
  onCancel: () => void;
  onRetry: () => void;
  onInsertAnswer: () => void;
  onUndo: () => void;
}) {
  if (state.tag === 'idle') return <span role="status">就绪</span>;
  if (state.tag === 'recording') return <><span role="status">正在录音</span><p>再次按键结束</p></>;
  if (state.tag === 'transcribing') return <><span role="status">正在识别</span><button onClick={onCancel}>取消</button></>;
  if (state.tag === 'processing') return <><span role="status">正在处理</span><button onClick={onCancel}>取消</button></>;
  if (state.tag === 'writingBack') return <span role="status">正在写入</span>;
  if (state.tag === 'showingAnswer') return <section><span role="status">回答完成</span><p>{state.text}</p><button onClick={onInsertAnswer}>插入答案</button></section>;
  if (state.tag === 'previewing') return <section><span role="status">文本已整理</span><p>{state.text}</p></section>;
  if (state.tag === 'completed') return <section><span role="status">已写入</span>{state.undoId && <button onClick={onUndo}>撤回</button>}</section>;
  return <section><span role="status">处理失败</span><p>{state.message}</p>{state.retryable && <button onClick={onRetry}>重试</button>}<button onClick={onCancel}>取消</button></section>;
}
