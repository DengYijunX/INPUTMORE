import type { SessionEvent, SessionState } from '../domain/actions';

const IDLE: SessionState = { tag: 'idle' };

export function reduce(state: SessionState, event: SessionEvent): SessionState {
  if (event.type === 'reset' && state.tag === 'completed') return IDLE;

  if (event.type === 'escape') {
    if (state.tag === 'recording' || state.tag === 'textInput' || state.tag === 'transcribing' || state.tag === 'processing' || state.tag === 'writingBack' || state.tag === 'showingAnswer') {
      return IDLE;
    }
    return state;
  }

  switch (state.tag) {
    case 'idle':
      if (event.type === 'shortcut') {
        return { tag: 'recording', action: event.action, startedAt: Date.now() };
      }
      return state;

    case 'recording':
      if (event.type === 'recording_stopped') {
        return { tag: 'transcribing', action: state.action, audioId: event.audioId };
      }
      if (event.type === 'failed') {
        return { tag: 'error', action: state.action, message: event.message, retryable: event.retryable, ...(event.copyText ? { copyText: event.copyText } : {}) };
      }
      return state;

    case 'textInput':
      return state;

    case 'transcribing':
      if (event.type === 'transcription_succeeded') {
        return { tag: 'processing', action: state.action, requestId: event.requestId };
      }
      if (event.type === 'failed') {
        return { tag: 'error', action: state.action, message: event.message, retryable: event.retryable, ...(event.copyText ? { copyText: event.copyText } : {}) };
      }
      return state;

    case 'processing':
      if (event.type === 'result_ready') {
        return state.action === 'ask'
          ? { tag: 'showingAnswer', text: event.text, requestId: state.requestId, ...(event.sources ? { sources: event.sources } : {}) }
          : state.action === 'translate'
            ? { tag: 'previewing', action: 'translate', text: event.text }
          : { tag: 'writingBack', action: state.action, text: event.text };
      }
      if (event.type === 'failed') {
        return { tag: 'error', action: state.action, message: event.message, retryable: event.retryable, ...(event.copyText ? { copyText: event.copyText } : {}) };
      }
      return state;

    case 'writingBack':
      if (event.type === 'writeback_succeeded') {
        return { tag: 'completed', action: state.action, undoId: event.undoId };
      }
      if (event.type === 'failed') {
        return { tag: 'error', action: state.action, message: event.message, retryable: event.retryable, ...(event.copyText ? { copyText: event.copyText } : {}) };
      }
      return state;

    case 'showingAnswer':
      if (event.type === 'answer_inserted') {
        return { tag: 'completed', action: 'ask', undoId: event.undoId };
      }
      return state;

    case 'previewing':
      return state;

    case 'error':
      if (event.type === 'shortcut' && state.retryable) {
        return { tag: 'recording', action: event.action, startedAt: Date.now() };
      }
      return state;

    case 'completed':
      if (event.type === 'shortcut') {
        return { tag: 'recording', action: event.action, startedAt: Date.now() };
      }
      return state;
  }
}
