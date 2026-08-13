import './App.css';
import { useEffect, useRef, useState } from 'react';
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
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
import type { TextOutputPort, TargetContext } from './capabilities/output/TextOutputPort';
import { createTauriTextOutput } from './infrastructure/output/TauriTextOutput';
import { COPY_TEXT_LABEL, WRITEBACK_FAILURE_COPY } from './presentation/errorCopy';

export function App() {
  if (new URLSearchParams(window.location.search).get('window') === 'settings') return <SettingsPage />;
  const [state, setState] = useState<SessionState>({ tag: 'idle' });
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const floatingCardRef = useRef<HTMLElement | null>(null);
  const stateRef = useRef(state);
  const captureRef = useRef<AudioCapture | undefined>(undefined);
  const transcriptionRef = useRef(new TranscriptionService());
  const processingAbortRef = useRef<AbortController | undefined>(undefined);
  const sessionVersionRef = useRef(0);
  const outputRef = useRef<TextOutputPort | undefined>(undefined);
  const targetRef = useRef<TargetContext | undefined>(undefined);
  const lastResultRef = useRef('');

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

  const cancelCurrentTask = () => {
    sessionVersionRef.current += 1;
    processingAbortRef.current?.abort();
    processingAbortRef.current = undefined;
    captureRef.current?.cancel();
    targetRef.current = undefined;
    setPreviewExpanded(false);
    setState({ tag: 'idle' });
  };

  useEffect(() => {
    const saved = loadAsrConfig();
    if (saved) transcriptionRef.current = new TranscriptionService(createAsrProvider(saved));
  }, []);

  useEffect(() => {
    if (!('__TAURI_INTERNALS__' in window)) return;

    outputRef.current = createTauriTextOutput();
    let frame = 0;
    let resizing = false;
    const resizeToContent = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const card = floatingCardRef.current;
        if (!card || resizing) return;
        const contentHeight = Math.ceil(card.getBoundingClientRect().height + 20);
        resizing = true;
        const windowHandle = getCurrentWindow();
        void windowHandle.setResizable(true)
          .then(() => windowHandle.setSize(new LogicalSize(380, Math.max(90, contentHeight))))
          .then(() => windowHandle.setResizable(false))
          .catch((error) => console.error('InputMore window resize failed', error))
          .finally(() => { resizing = false; });
      });
    };
    resizeToContent();
    const observer = floatingCardRef.current ? new ResizeObserver(resizeToContent) : undefined;
    if (floatingCardRef.current && observer) observer.observe(floatingCardRef.current);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [state.tag, previewExpanded]);

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
        void outputRef.current?.captureTarget()
          .then((target) => {
            if (sessionVersion !== sessionVersionRef.current) return;
            targetRef.current = target;
            setState(reduce(current, sessionEvent));
            return captureRef.current?.start();
          })
          .catch((error) => {
          console.error('InputMore microphone start failed', error);
          captureRef.current?.cancel();
          targetRef.current = undefined;
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
            setPreviewExpanded(false);
            lastResultRef.current = result.text;
            const target = targetRef.current;
            const output = outputRef.current;
            if (!target || !output) throw new Error('没有可用的输入位置');
            setState({ tag: 'writingBack', action: 'enhance', text: result.text });
            return output.insertText(result.text, target).then((outputResult) => {
              if (sessionVersion !== sessionVersionRef.current || controller.signal.aborted) return;
              if (!outputResult.ok) {
                processingAbortRef.current = undefined;
                setState({ tag: 'error', action: 'enhance', message: WRITEBACK_FAILURE_COPY, retryable: false });
                return;
              }
              processingAbortRef.current = undefined;
              targetRef.current = undefined;
              setState(reduce({ tag: 'writingBack', action: 'enhance', text: result.text }, { type: 'writeback_succeeded', undoId: outputResult.undoId }));
            });
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
      <section ref={floatingCardRef} className="floating-card" data-testid="capsule" data-state={state.tag === 'transcribing' ? 'processing' : state.tag} data-theme={theme}>
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
            {state.tag === 'recording' ? 'REC' : state.tag === 'transcribing' || state.tag === 'processing' ? 'PROCESSING' : state.tag === 'writingBack' ? 'WRITING' : state.tag === 'previewing' ? 'PREVIEW' : state.tag === 'completed' ? 'DONE' : state.tag === 'error' ? 'ERROR' : 'READY'}
          </span>
          {(state.tag === 'transcribing' || state.tag === 'processing' || state.tag === 'writingBack') && <ProcessingIndicator />}
          {state.tag === 'idle' && <button className="settings-button" type="button" aria-label="设置" onClick={() => void openSettings()}>⚙</button>}
          {(state.tag === 'transcribing' || state.tag === 'processing' || state.tag === 'writingBack' || state.tag === 'previewing' || state.tag === 'error') && <button className="cancel-button" type="button" aria-label="取消" onClick={cancelCurrentTask}>×</button>}
        </div>
        {state.tag === 'error' && <div className="error-actions"><p className="error-message">{state.message}</p><button className="copy-text-button" type="button" onClick={() => void outputRef.current?.copyText(lastResultRef.current)}>{COPY_TEXT_LABEL}</button></div>}
        {state.tag === 'previewing' && (
          <section className={`preview-panel${previewExpanded ? ' is-expanded' : ''}`} data-testid="preview-panel">
            <button className="preview-panel-header" type="button" onClick={() => setPreviewExpanded((expanded) => !expanded)} aria-expanded={previewExpanded}>
              <span>整理结果</span><span>{previewExpanded ? '收起⌃' : '展开⌄'}</span>
            </button>
            <p className="preview-text">{previewExpanded ? state.text : `${state.text.slice(0, 34)}${state.text.length > 34 ? '…' : ''}`}</p>
            {previewExpanded && <p className="preview-hint">文本已整理，当前版本尚未写回输入框</p>}
          </section>
        )}
      </section>
    </main>
  );
}
