import './App.css';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { startDragFromPointer } from './presentation/windowDrag';

export function App() {
  return (
    <main className="app-shell" aria-label="InputMore">
      <section className="floating-card">
        <div
          className="brand-row"
          data-tauri-drag-region
          onPointerDown={(event) => {
            void startDragFromPointer(event, () => getCurrentWindow().startDragging());
          }}
        >
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span className="brand-name">InputMore</span>
          <span className="ready-dot" aria-hidden="true" />
        </div>
        <div className="status-row">
          <span className="status-icon" aria-hidden="true">◌</span>
          <span role="status">就绪</span>
        </div>
        <p className="hint">按快捷键开始优化转写</p>
      </section>
    </main>
  );
}
