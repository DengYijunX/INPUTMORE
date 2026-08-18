import type { Action, SessionState } from '../domain/actions';

export function canStartShortcut(state: SessionState, action: Action): boolean {
  if (state.tag === 'idle' || state.tag === 'completed') return true;
  return state.tag === 'error' && state.action === 'enhance' && action === 'enhance';
}
