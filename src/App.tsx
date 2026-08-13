import './App.css';
import { useEffect, useRef, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import type { SessionState } from './domain/actions';
import { reduce } from './state/sessionMachine';
import { toSessionEvent } from './application/shortcutEvents';
import { startDragFromPointer } from './presentation/windowDrag';
import { AudioCapture } from './infrastructure/audio/audioCapture';
import { TranscriptionService } from './capabilities/transcription/TranscriptionService';

export function App() {
  const [state, setState] = useState<SessionState>({ tag: 'idle' });
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const stateRef = useRef(state);
  const captureRef = useRef<AudioCapture | undefined>(undefined);
  const transcriptionRef = useRef(new TranscriptionService());

  stateRef.current = state;

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: light)');
    if (!media) return;
    const update = () => setTheme(media.matches ? 'light' : 'dark');
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (!('__TAURI_INTERNALS__' in window)) return;

    if (navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined') {
      captureRef.current = new AudioCapture({
        getUserMedia: (constraints) => navigator.mediaDevices.getUserMedia(constraints),
        createRecorder: (stream) => new MediaRecorder(stream),
      });
    }

    let unlisten: (() => void) | undefined;
    void listen<{ action: 'enhance'; phase: 'pressed' | 'released' }>('inputmore://shortcut', (event) => {
      const current = stateRef.current;
      const sessionEvent = toSessionEvent(event.payload, current.tag === 'recording');
      if (!sessionEvent) return;

      if (sessionEvent.type === 'shortcut' && current.tag === 'idle') {
        setState(reduce(current, sessionEvent));
        void captureRef.current?.start().catch((error) => {
          console.error('InputMore microphone start failed', error);
          captureRef.current?.cancel();
          setState({ tag: 'error', action: 'enhance', message: error instanceof Error ? error.message : '麦克风不可用', retryable: true });
        });
        return;
      }

      if (sessionEvent.type === 'recording_stopped' && current.tag === 'recording') {
        setState(reduce(current, sessionEvent));
        void captureRef.current?.stop()
          .then((audio) => transcriptionRef.current.transcribe(audio))
          .then(() => {
            setState({ tag: 'error', action: 'enhance', message: '转录完成，但文本处理尚未接入', retryable: false });
          })
          .catch((error) => {
            console.error('InputMore transcription failed', error);
            setState({ tag: 'error', action: 'enhance', message: error instanceof Error ? error.message : '转录失败', retryable: false });
          });
      }
    }).then((cleanup) => {
      unlisten = cleanup;
    });

    return () => {
      unlisten?.();
      captureRef.current?.cancel();
    };
  }, []);

  return (
    <main className="app-shell" aria-label="InputMore">
      <section className="floating-card" data-testid="capsule" data-state={state.tag === 'transcribing' ? 'processing' : state.tag} data-theme={theme}>
        <div
          className="capsule-content"
          data-tauri-drag-region
          onPointerDown={(event) => {
            void startDragFromPointer(event, () => getCurrentWindow().startDragging())
              .catch((error) => console.error('InputMore window drag failed', error));
          }}
        >
          <span className="mic-icon" aria-hidden="true">♩</span>
          {state.tag !== 'idle' && <span className="waveform" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span>}
          {state.tag === 'idle' && <span className="idle-label">InputMore</span>}
          <span className="capsule-status" role="status">
            {state.tag === 'recording' ? 'REC' : state.tag === 'transcribing' || state.tag === 'processing' ? 'PROCESSING' : state.tag === 'completed' ? 'DONE' : state.tag === 'error' ? 'ERROR' : 'READY'}
          </span>
          {(state.tag === 'transcribing' || state.tag === 'processing' || state.tag === 'error') && <button className="cancel-button" type="button" aria-label="取消" onClick={() => { captureRef.current?.cancel(); setState({ tag: 'idle' }); }}>×</button>}
        </div>
        {state.tag === 'error' && <p className="error-message">{state.message}</p>}
      </section>
    </main>
  );
}
