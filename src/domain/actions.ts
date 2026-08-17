export type Action = 'rawWrite' | 'enhance' | 'translate' | 'ask';

export type SessionState =
  | { tag: 'idle' }
  | { tag: 'recording'; action: Action; startedAt: number }
  | { tag: 'transcribing'; action: Action; audioId: string }
  | { tag: 'processing'; action: Action; requestId: string }
  | { tag: 'writingBack'; action: 'rawWrite' | 'enhance' | 'translate'; text: string }
  | { tag: 'showingAnswer'; text: string; requestId: string }
  | { tag: 'previewing'; action: 'rawWrite' | 'enhance' | 'translate'; text: string }
  | { tag: 'completed'; action: Action; undoId?: string }
  | { tag: 'error'; action?: Action; message: string; retryable: boolean; copyText?: string };

export type SessionEvent =
  | { type: 'shortcut'; action: Action; durationMs: number; targetWindowId?: string }
  | { type: 'recording_stopped'; audioId: string }
  | { type: 'transcription_started'; requestId: string }
  | { type: 'transcription_succeeded'; requestId: string }
  | { type: 'processing_started'; requestId: string }
  | { type: 'result_ready'; text: string }
  | { type: 'writeback_succeeded'; undoId?: string }
  | { type: 'answer_inserted'; undoId?: string }
  | { type: 'completed'; undoId?: string }
  | { type: 'reset' }
  | { type: 'failed'; message: string; retryable: boolean; copyText?: string }
  | { type: 'escape' };
