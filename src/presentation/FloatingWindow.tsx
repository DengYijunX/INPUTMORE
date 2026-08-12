import type { SessionState } from '../domain/actions';
import { StatusView } from './StatusView';

export function FloatingWindow(props: {
  state: SessionState;
  onCancel: () => void;
  onRetry: () => void;
  onInsertAnswer: () => void;
  onUndo: () => void;
}) {
  return <main aria-label="InputMore 浮窗"><StatusView {...props} /></main>;
}
