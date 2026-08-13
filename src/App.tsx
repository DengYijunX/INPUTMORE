import './App.css';
import { useEffect, useRef, useState } from 'react';
import { getCurrentWindow, PhysicalPosition, LogicalSize } from '@tauri-apps/api/window';
import { emit, listen } from '@tauri-apps/api/event';
import type { SessionState } from './domain/actions';
import { reduce } from './state/sessionMachine';
import { toSessionEvent } from './application/shortcutEvents';
import { startDragFromPointer } from './presentation/windowDrag';
import { AudioCapture } from './infrastructure/audio/audioCapture';
import { TranscriptionService } from './capabilities/transcription/TranscriptionService';
import { createAsrProvider } from './infrastructure/providers/asr/createAsrProvider';
import { loadAsrConfig } from './infrastructure/config/providerConfig';
import { loadLlmConfig } from './infrastructure/config/providerConfig';
import { OpenAICompatibleLlm } from './infrastructure/providers/llm/OpenAICompatibleLlm';
import { TextTransformationService } from './capabilities/text/TextTransformationService';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { SettingsPage } from './SettingsPage';
import { ProcessingIndicator } from './presentation/ProcessingIndicator';
import { PreviewPage } from './PreviewPage';

const PREVIEW_WIDTH = 420;
const PREVIEW_GAP = 8;

export function App() {
  if (new URLSearchParams(window.location.search).get('window') === 'settings') return <SettingsPage />;
  if (new URLSearchParams(window.location.search).get('window') === 'preview') return <PreviewPage />;
  const [state, setState] = useState<SessionState>({ tag: 'idle' });
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const stateRef = useRef(state);
  const captureRef = useRef<AudioCapture | undefined>(undefined);
  const transcriptionRef = useRef(new TranscriptionService());
  const processingAbortRef = useRef<AbortController | undefined>(undefined);
  const sessionVersionRef = useRef(0);

  stateRef.current = state;

  const openSettings = async () => {
    if (!('__TAURI_INTERNALS__' in window)) {
      setState({ tag: 'error', action: 'enhance', message: '设置窗口只能在桌面应用中打开', retryable: false });
      return;
    }
    const existing = await WebviewWindow.getByLabel('settings');
    if (existing) { await existing.show(); await existing.setFocus(); return; }
    const settings = new WebviewWindow('settings', { url: 'index.html?window=settings', title: 'InputMore 设置', width: 760, height: 620, resizable: true, center: true });
    settings.once('tauri://error', (event) => console.error('InputMore settings window failed', event));
  };

  const getPreviewPosition = async () => {
    const mainWindow = getCurrentWindow();
    const position = await mainWindow.outerPosition();
    const size = await mainWindow.outerSize();
    return new PhysicalPosition(
      position.x + Math.max(0, Math.round((size.width - PREVIEW_WIDTH) / 2)),
      position.y + size.height + PREVIEW_GAP,
    );
  };

  const syncPreviewPosition = async () => {
    if (!('__TAURI_INTERNALS__' in window)) return;
    const preview = await WebviewWindow.getByLabel('preview');
    if (!preview) return;
    await preview.setPosition(await getPreviewPosition());
  };

  const closePreviewWindow = async () => {
    const preview = await WebviewWindow.getByLabel('preview');
    if (preview) await preview.close();
  };

  const openPreviewWindow = async (text: string) => {
    if (!('__TAURI_INTERNALS__' in window)) return;
    localStorage.setItem('inputmore.preview.text', text);
    const position = await getPreviewPosition();
    const existing = await WebviewWindow.getByLabel('preview');
    if (existing) {
      await existing.setPosition(position);
      await existing.show();
      await existing.setFocus();
      await emit('inputmore://preview', { text });
      return;
    }
    const preview = new WebviewWindow('preview', {
      url: 'index.html?window=preview', title: 'InputMore 结果', width: PREVIEW_WIDTH, height: 108, x: position.x, y: position.y,
      resizable: false, decorations: false, alwaysOnTop: true, transparent: true, backgroundColor: '#00000000', shadow: false,
    });
    preview.once('tauri://created', () => void emit('inputmore://preview', { text }));
    preview.once('tauri://error', (event) => console.error('InputMore preview window failed', event));
  };

  const cancelCurrentTask = () => {
    sessionVersionRef.current += 1;
    processingAbortRef.current?.abort();
    processingAbortRef.current = undefined;
    captureRef.current?.cancel();
    void closePreviewWindow().catch((error) => console.error('InputMore preview close failed', error));
    setState({ tag: 'idle' });
  };

  useEffect(() => {
    const saved = loadAsrConfig();
    if (saved) transcriptionRef.current = new TranscriptionService(createAsrProvider(saved));
  }, []);

  useEffect(() => {
    if (!('__TAURI_INTERNALS__' in window)) return;
    void getCurrentWindow().setSize(new LogicalSize(380, 90))
      .catch((error) => console.error('InputMore window resize failed', error));
  }, [state.tag]);

  useEffect(() => {
    if (!('__TAURI_INTERNALS__' in window)) return;
    let unlisten: (() => void) | undefined;
    const mainWindow = getCurrentWindow();
    void mainWindow.onMoved(() => {
      void syncPreviewPosition().catch((error) => console.error('InputMore preview position sync failed', error));
    }).then((cleanup) => { unlisten = cleanup; });
    return () => unlisten?.();
  }, []);

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
        const sessionVersion = ++sessionVersionRef.current;
        setState(reduce(current, sessionEvent));
        void captureRef.current?.start().catch((error) => {
          console.error('InputMore microphone start failed', error);
          captureRef.current?.cancel();
          setState({ tag: 'error', action: 'enhance', message: error instanceof Error ? error.message : '麦克风不可用', retryable: true });
        });
        return;
      }

      if (sessionEvent.type === 'recording_stopped' && current.tag === 'recording') {
        const sessionVersion = sessionVersionRef.current;
        setState(reduce(current, sessionEvent));
        const controller = new AbortController();
        processingAbortRef.current = controller;
        const savedConfig = loadAsrConfig();
        const transcription = savedConfig
          ? new TranscriptionService(createAsrProvider(savedConfig))
          : transcriptionRef.current;
        void captureRef.current?.stop()
          .then((audio) => transcription.transcribe(audio, controller.signal))
          .then((transcript) => {
            const llmConfig = loadLlmConfig();
            if (!llmConfig) throw new Error('文本处理服务未配置，请在设置中配置 LLM Provider');
            setState({ tag: 'processing', action: 'enhance', requestId: crypto.randomUUID() });
            const transformer = new TextTransformationService(new OpenAICompatibleLlm(llmConfig), llmConfig.model);
            return transformer.transform({ action: 'enhance', sourceText: transcript.text }, controller.signal);
          })
          .then((result) => {
            if (sessionVersion !== sessionVersionRef.current || controller.signal.aborted) return;
            processingAbortRef.current = undefined;
            setState({ tag: 'previewing', action: 'enhance', text: result.text });
            void openPreviewWindow(result.text);
          })
          .catch((error) => {
            processingAbortRef.current = undefined;
            if (controller.signal.aborted || sessionVersion !== sessionVersionRef.current) return;
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
            {state.tag === 'recording' ? 'REC' : state.tag === 'transcribing' || state.tag === 'processing' ? 'PROCESSING' : state.tag === 'previewing' ? 'PREVIEW' : state.tag === 'completed' ? 'DONE' : state.tag === 'error' ? 'ERROR' : 'READY'}
          </span>
          {(state.tag === 'transcribing' || state.tag === 'processing') && <ProcessingIndicator />}
          {state.tag === 'idle' && <button className="settings-button" type="button" aria-label="设置" onClick={() => void openSettings()}>⚙</button>}
          {(state.tag === 'transcribing' || state.tag === 'processing' || state.tag === 'previewing' || state.tag === 'error') && <button className="cancel-button" type="button" aria-label="取消" onClick={cancelCurrentTask}>×</button>}
        </div>
        {state.tag === 'error' && <p className="error-message">{state.message}</p>}
      </section>
    </main>
  );
}
