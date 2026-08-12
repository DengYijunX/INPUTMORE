import './App.css';
import { useEffect, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import type { SessionState } from './domain/actions';
import { reduce } from './state/sessionMachine';
import { startDragFromPointer } from './presentation/windowDrag';

export function App() {
  const [state, setState] = useState<SessionState>({ tag: 'idle' });

  useEffect(() => {
    if (!('__TAURI_INTERNALS__' in window)) return;

    let unlisten: (() => void) | undefined;
    void listen<{ action: 'enhance'; phase: 'pressed' | 'released' }>('inputmore://shortcut', (event) => {
      if (event.payload.phase === 'pressed') {
        setState((current) => reduce(current, {
          type: 'shortcut',
          action: event.payload.action,
          durationMs: 0,
        }));
      }
    }).then((cleanup) => {
      unlisten = cleanup;
    });

    return () => unlisten?.();
  }, []);

  return (
    <main className="app-shell" aria-label="InputMore">
      <section className="floating-card">
        <div
          className="brand-row"
          data-tauri-drag-region
          onPointerDown={(event) => {
            void startDragFromPointer(event, () => getCurrentWindow().startDragging())
              .catch((error) => console.error('InputMore window drag failed', error));
          }}
        >
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span className="brand-name">InputMore</span>
          <span className="ready-dot" aria-hidden="true" />
        </div>
        <div className="status-row">
          <span className="status-icon" aria-hidden="true">◌</span>
          <span role="status">{state.tag === 'recording' ? '正在录音' : '就绪'}</span>
        </div>
        <p className="hint">{state.tag === 'recording' ? '再次按快捷键结束' : 'Ctrl + Shift + Space 开始优化转写'}</p>
      </section>
    </main>
  );
}
