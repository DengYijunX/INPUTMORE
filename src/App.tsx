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
import { loadAsrConfig, loadLlmConfig, loadRawWriteLlmEnabled } from './infrastructure/config/providerConfig';
import { OpenAICompatibleLlm } from './infrastructure/providers/llm/OpenAICompatibleLlm';
import { TextTransformationService } from './capabilities/text/TextTransformationService';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { SettingsPage } from './SettingsPage';
import { ProcessingIndicator } from './presentation/ProcessingIndicator';
import type { TextOutputPort, TargetContext } from './capabilities/output/TextOutputPort';
import { createTauriTextOutput } from './infrastructure/output/TauriTextOutput';
import { COPY_TEXT_LABEL, WRITEBACK_FAILURE_COPY } from './presentation/errorCopy';
import { shouldSubmitTextInput } from './application/textInput';
import { createTauriSelectedTextInput } from './infrastructure/input/TauriSelectedTextInput';
import { canStartShortcut } from './application/shortcutAvailability';

export function App() {
  if (new URLSearchParams(window.location.search).get('window') === 'settings') return <SettingsPage />;
  const [state, setState] = useState<SessionState>({ tag: 'idle' });
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [textDraft, setTextDraft] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const floatingCardRef = useRef<HTMLElement | null>(null);
  const stateRef = useRef(state);
  const captureRef = useRef<AudioCapture | undefined>(undefined);
  const transcriptionRef = useRef(new TranscriptionService());
  const processingAbortRef = useRef<AbortController | undefined>(undefined);
  const stopRequestedRef = useRef(false);
  const sessionVersionRef = useRef(0);
  const outputRef = useRef<TextOutputPort | undefined>(undefined);
  const selectedTextInputRef = useRef<ReturnType<typeof createTauriSelectedTextInput> | undefined>(undefined);
  const targetRef = useRef<TargetContext | undefined>(undefined);

  stateRef.current = state;

  const openSettings = async () => {
    if (!('__TAURI_INTERNALS__' in window)) {
      setState({ tag: 'error', action: 'rawWrite', message: '设置窗口只能在桌面应用中打开', retryable: false });
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
    stopRequestedRef.current = false;
    targetRef.current = undefined;
    setPreviewExpanded(false);
    setTextDraft('');
    setState({ tag: 'idle' });
  };

  const undoLastWrite = () => {
    const target = targetRef.current;
    const output = outputRef.current;
    if (!target || !output || stateRef.current.tag !== 'completed') return;
    const sessionVersion = ++sessionVersionRef.current;
    void output.undoText(target).then((result) => {
      if (sessionVersion !== sessionVersionRef.current) return;
      targetRef.current = undefined;
      if (result.ok) {
        setState({ tag: 'idle' });
      } else {
        setState({ tag: 'error', action: 'rawWrite', message: '撤回失败，请手动撤销', retryable: false });
      }
    });
  };

  const copyText = async (text: string) => {
    if (!text || !outputRef.current) return;
    try {
      await outputRef.current.copyText(text);
      setCopyFeedback(true);
      window.setTimeout(() => setCopyFeedback(false), 1200);
    } catch (error) {
      console.error('InputMore copy fallback failed', error);
    }
  };

  const copyCurrentErrorText = async () => {
    if (state.tag !== 'error' || !state.copyText) return;
    await copyText(state.copyText);
  };

  const startTextRewrite = () => {
    setCopyFeedback(false);
    setTextDraft('');
    setState({ tag: 'textInput', action: 'enhance', text: '' });
  };

  const transformTextToPreview = async (sourceText: string, sessionVersion: number, controller: AbortController) => {
    const llmConfig = loadLlmConfig();
    if (!llmConfig) {
      processingAbortRef.current = undefined;
      setState({ tag: 'error', action: 'enhance', message: '文本转写需要先配置 LLM Provider', retryable: false });
      return;
    }

    setPreviewExpanded(false);
    setState({ tag: 'processing', action: 'enhance', requestId: crypto.randomUUID() });

    try {
      const transformer = new TextTransformationService(new OpenAICompatibleLlm(llmConfig), llmConfig.model);
      const result = await transformer.transform({ action: 'enhance', sourceText }, controller.signal);
      if (controller.signal.aborted || sessionVersion !== sessionVersionRef.current) return;
      const text = result.text.trim();
      if (!text) throw new Error('LLM 未返回有效文本');
      processingAbortRef.current = undefined;
      setState({ tag: 'previewing', action: 'enhance', text });
    } catch (error) {
      processingAbortRef.current = undefined;
      if (controller.signal.aborted || sessionVersion !== sessionVersionRef.current) return;
      console.error('InputMore text transformation failed', error);
      setState({ tag: 'error', action: 'enhance', message: error instanceof Error ? error.message : '文本转写失败', retryable: false });
    }
  };

  const submitTextRewrite = async () => {
    const sourceText = textDraft.trim();
    if (!sourceText) return;
    const sessionVersion = ++sessionVersionRef.current;
    const controller = new AbortController();
    processingAbortRef.current = controller;
    await transformTextToPreview(sourceText, sessionVersion, controller);
  };

  const startSelectedTextRewrite = async (target: TargetContext, sessionVersion: number) => {
    const selectedTextInput = selectedTextInputRef.current;
    if (!selectedTextInput) {
      targetRef.current = undefined;
      setState({ tag: 'error', action: 'enhance', message: '当前环境无法读取选中文字', retryable: false });
      return;
    }

    const controller = new AbortController();
    processingAbortRef.current = controller;
    try {
      const selectedText = await selectedTextInput.captureSelectedText(target, controller.signal);
      if (controller.signal.aborted || sessionVersion !== sessionVersionRef.current) return;
      if (!selectedText) {
        processingAbortRef.current = undefined;
        targetRef.current = undefined;
        setState({ tag: 'error', action: 'enhance', message: '未检测到选中文字', retryable: false });
        return;
      }
      targetRef.current = undefined;
      await transformTextToPreview(selectedText, sessionVersion, controller);
    } catch (error) {
      processingAbortRef.current = undefined;
      if (controller.signal.aborted || sessionVersion !== sessionVersionRef.current) return;
      console.error('InputMore selected text capture failed', error);
      setState({ tag: 'error', action: 'enhance', message: '读取选中文字失败', retryable: false });
    }
  };

  useEffect(() => {
    const saved = loadAsrConfig();
    if (saved) transcriptionRef.current = new TranscriptionService(createAsrProvider(saved));
  }, []);

  useEffect(() => {
    if (!('__TAURI_INTERNALS__' in window)) return;

    outputRef.current = createTauriTextOutput();
    selectedTextInputRef.current = createTauriSelectedTextInput();
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
    if (state.tag !== 'completed') return;
    const timer = window.setTimeout(() => {
      if (stateRef.current.tag === 'completed') {
        targetRef.current = undefined;
        setState(reduce(stateRef.current, { type: 'reset' }));
      }
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [state.tag]);

  useEffect(() => {
    if (!('__TAURI_INTERNALS__' in window)) return;

    if (navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined') {
      captureRef.current = new AudioCapture({
        getUserMedia: (constraints) => navigator.mediaDevices.getUserMedia(constraints),
        createRecorder: (stream) => new MediaRecorder(stream),
      });
    }

    let unlisten: (() => void) | undefined;
    void listen<{ action: 'rawWrite' | 'enhance'; phase: 'pressed' | 'released'; targetWindowId?: string }>('inputmore://shortcut', (event) => {
      const current = stateRef.current;
      const sessionEvent = toSessionEvent(event.payload, current.tag === 'recording');
      if (!sessionEvent) return;

      if (sessionEvent.type === 'shortcut' && canStartShortcut(current, sessionEvent.action)) {
        const sessionVersion = ++sessionVersionRef.current;
        if (!sessionEvent.targetWindowId) {
          setState({ tag: 'error', action: 'rawWrite', message: '没有可用的输入位置', retryable: true });
          return;
        }
        const target = { id: sessionEvent.targetWindowId };
        targetRef.current = target;
        stopRequestedRef.current = false;
        if (sessionEvent.action === 'enhance') {
          void startSelectedTextRewrite(target, sessionVersion);
          return;
        }
        const startRecording = () => {
          processingAbortRef.current = undefined;
          setState(reduce(current, sessionEvent));
          void captureRef.current?.start().catch((error) => {
            console.error('InputMore microphone start failed', error);
            captureRef.current?.cancel();
            targetRef.current = undefined;
            setState({ tag: 'error', action: 'rawWrite', message: error instanceof Error ? error.message : '麦克风不可用', retryable: true });
          });
        };
        startRecording();
        return;
      }

      if (sessionEvent.type === 'recording_stopped' && current.tag === 'recording' && !stopRequestedRef.current) {
        stopRequestedRef.current = true;
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
          .then(async (transcript) => {
            if (sessionVersion !== sessionVersionRef.current || controller.signal.aborted) return;
            setPreviewExpanded(false);
            let text = transcript.text.trim();
            if (!text) throw new Error('没有识别到有效语音');
            if (loadRawWriteLlmEnabled()) {
              const llmConfig = loadLlmConfig();
              if (!llmConfig) throw new Error('已开启 LLM 整理，但尚未配置文本模型');
              setState({ tag: 'processing', action: 'rawWrite', requestId: crypto.randomUUID() });
              const transformer = new TextTransformationService(new OpenAICompatibleLlm(llmConfig), llmConfig.model);
              text = (await transformer.transform({ action: 'enhance', sourceText: text }, controller.signal)).text.trim();
              if (!text) throw new Error('LLM 未返回有效文本');
            }
            const target = targetRef.current;
            const output = outputRef.current;
            if (!target || !output) throw new Error('没有可用的输入位置');
            setState({ tag: 'writingBack', action: 'rawWrite', text });
            return output.insertText(text, target, controller.signal).then((outputResult) => {
              if (sessionVersion !== sessionVersionRef.current || controller.signal.aborted) return;
              if (!outputResult.ok) {
                processingAbortRef.current = undefined;
                setState({ tag: 'error', action: 'rawWrite', message: WRITEBACK_FAILURE_COPY, retryable: false, copyText: text });
                return;
              }
              processingAbortRef.current = undefined;
              setState(reduce({ tag: 'writingBack', action: 'rawWrite', text }, { type: 'writeback_succeeded', undoId: outputResult.undoId }));
            });
          })
          .catch((error) => {
            processingAbortRef.current = undefined;
            if (controller.signal.aborted || sessionVersion !== sessionVersionRef.current) return;
            console.error('InputMore transcription failed', error);
            setState({ tag: 'error', action: 'rawWrite', message: error instanceof Error ? error.message : '转录失败', retryable: false });
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
            {state.tag === 'recording' ? 'REC' : state.tag === 'textInput' ? 'TEXT' : state.tag === 'transcribing' || state.tag === 'processing' ? 'PROCESSING' : state.tag === 'writingBack' ? 'WRITING' : state.tag === 'previewing' ? 'PREVIEW' : state.tag === 'completed' ? 'DONE' : state.tag === 'error' ? 'ERROR' : 'READY'}
          </span>
          {(state.tag === 'transcribing' || state.tag === 'processing' || state.tag === 'writingBack') && <ProcessingIndicator />}
          {state.tag === 'idle' && <button className="text-input-button" type="button" aria-label="文本转写" onClick={startTextRewrite}>文本</button>}
          {state.tag === 'idle' && <button className="settings-button" type="button" aria-label="设置" onClick={() => void openSettings()}>⚙</button>}
          {state.tag === 'completed' && <button className="undo-button" type="button" onClick={undoLastWrite}>撤回</button>}
          {(state.tag === 'textInput' || state.tag === 'transcribing' || state.tag === 'processing' || state.tag === 'writingBack' || state.tag === 'previewing' || state.tag === 'error') && <button className="cancel-button" type="button" aria-label="取消" onClick={cancelCurrentTask}>×</button>}
        </div>
        {state.tag === 'textInput' && <section className="text-input-panel" data-testid="text-input-panel">
          <textarea
            autoFocus
            value={textDraft}
            placeholder="输入或粘贴要转写的内容"
            onChange={(event) => {
              setTextDraft(event.target.value);
              setState({ tag: 'textInput', action: 'enhance', text: event.target.value });
            }}
            onKeyDown={(event) => {
              if (shouldSubmitTextInput(event)) {
                event.preventDefault();
                void submitTextRewrite();
              } else if (event.key === 'Escape') {
                event.preventDefault();
                cancelCurrentTask();
              }
            }}
          />
          <div className="text-input-footer">
            <span>Ctrl+Enter 提交</span>
            <button className="text-submit-button" type="button" disabled={!textDraft.trim()} onClick={() => void submitTextRewrite()}>转写</button>
          </div>
        </section>}
        {state.tag === 'error' && <div className="error-actions"><p className="error-message">{state.message}</p>{state.copyText && <button className="copy-text-button" type="button" onClick={() => void copyCurrentErrorText()}>{copyFeedback ? '已复制' : COPY_TEXT_LABEL}</button>}</div>}
        {state.tag === 'previewing' && (
          <section className={`preview-panel${previewExpanded ? ' is-expanded' : ''}`} data-testid="preview-panel">
            <button className="preview-panel-header" type="button" onClick={() => setPreviewExpanded((expanded) => !expanded)} aria-expanded={previewExpanded}>
              <span>整理结果</span><span>{previewExpanded ? '收起⌃' : '展开⌄'}</span>
            </button>
            <p className="preview-text">{previewExpanded ? state.text : `${state.text.slice(0, 34)}${state.text.length > 34 ? '…' : ''}`}</p>
            {previewExpanded && <p className="preview-hint">文本已整理，当前版本尚未写回输入框</p>}
            <button className="copy-text-button preview-copy-button" type="button" onClick={() => void copyText(state.text)}>{copyFeedback ? '已复制' : '复制文本'}</button>
          </section>
        )}
      </section>
    </main>
  );
}
