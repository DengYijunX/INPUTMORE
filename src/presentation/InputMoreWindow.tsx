import type { PointerEvent, RefObject } from 'react';
import type { SessionState } from '../domain/actions';
import type { TranslationLanguage } from '../infrastructure/config/translationConfig';
import { shouldSubmitTextInput } from '../application/textInput';
import { ProcessingIndicator } from './ProcessingIndicator';
import { formatDuration } from './formatDuration';
import { COPY_TEXT_LABEL } from './errorCopy';

type InputMoreWindowProps = {
  state: SessionState;
  theme: 'light' | 'dark';
  previewExpanded: boolean;
  copyFeedback: boolean;
  textDraft: string;
  targetLanguage: string;
  translationLanguages: TranslationLanguage[];
  floatingCardRef: RefObject<HTMLElement | null>;
  onPreviewToggle: () => void;
  onTextDraftChange: (value: string) => void;
  onTargetLanguageChange: (value: string) => void;
  onTextSubmit: () => void;
  onStartTextRewrite: () => void;
  onStartRetrieval: () => void;
  onStartTranslation: () => void;
  onOpenSettings: () => void;
  onCancel: () => void;
  onUndo: () => void;
  onCopy: (text: string) => void;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
};

export function InputMoreWindow({
  state,
  theme,
  previewExpanded,
  copyFeedback,
  textDraft,
  targetLanguage,
  translationLanguages,
  floatingCardRef,
  onPreviewToggle,
  onTextDraftChange,
  onTargetLanguageChange,
  onTextSubmit,
  onStartTextRewrite,
  onStartRetrieval,
  onStartTranslation,
  onOpenSettings,
  onCancel,
  onUndo,
  onCopy,
  onPointerDown,
}: InputMoreWindowProps) {
  return (
    <main className="app-shell" aria-label="InputMore">
      <section ref={floatingCardRef} className="floating-card" data-testid="capsule" data-state={state.tag === 'transcribing' ? 'processing' : state.tag} data-theme={theme}>
        <div
          className="capsule-content"
          data-tauri-drag-region
          onPointerDown={onPointerDown}
        >
          <span className="mic-icon" aria-hidden="true">♩</span>
          {state.tag !== 'idle' && <span className="waveform" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span>}
          {state.tag === 'idle' && <span className="idle-label">InputMore</span>}
          <span className="capsule-status" role="status">
            {state.tag === 'recording' ? 'REC' : state.tag === 'textInput' ? (state.action === 'ask' ? 'SEARCH' : state.action === 'translate' ? 'TRANSLATE' : 'TEXT') : state.tag === 'transcribing' || state.tag === 'processing' ? 'PROCESSING' : state.tag === 'writingBack' ? 'WRITING' : state.tag === 'previewing' ? 'PREVIEW' : state.tag === 'showingAnswer' ? 'ANSWER' : state.tag === 'completed' ? 'DONE' : state.tag === 'error' ? 'ERROR' : 'READY'}
          </span>
          {(state.tag === 'transcribing' || state.tag === 'processing' || state.tag === 'writingBack') && <ProcessingIndicator />}
          {state.tag === 'idle' && <button className="text-input-button" type="button" aria-label="文本转写" onClick={onStartTextRewrite}>文本</button>}
          {state.tag === 'idle' && <button className="text-input-button" type="button" aria-label="翻译" onClick={onStartTranslation}>翻译</button>}
          {state.tag === 'idle' && <button className="text-input-button" type="button" aria-label="网页检索" onClick={onStartRetrieval}>检索</button>}
          {state.tag === 'idle' && <button className="settings-button" type="button" aria-label="设置" onClick={onOpenSettings}>⚙</button>}
          {state.tag === 'completed' && <button className="undo-button" type="button" onClick={onUndo}>撤回</button>}
          {(state.tag === 'textInput' || state.tag === 'transcribing' || state.tag === 'processing' || state.tag === 'writingBack' || state.tag === 'previewing' || state.tag === 'showingAnswer' || state.tag === 'error') && <button className="cancel-button" type="button" aria-label="取消" onClick={onCancel}>×</button>}
        </div>
        {state.tag === 'textInput' && <section className="text-input-panel" data-testid="text-input-panel">
          <textarea
            autoFocus
            value={textDraft}
            placeholder={state.action === 'ask' ? '输入要检索的问题' : state.action === 'translate' ? '输入要翻译的内容' : '输入或粘贴要转写的内容'}
            onChange={(event) => onTextDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (shouldSubmitTextInput(event)) {
                event.preventDefault();
                onTextSubmit();
              } else if (event.key === 'Escape') {
                event.preventDefault();
                onCancel();
              }
            }}
          />
          {state.action === 'translate' && <select className="target-language-select" value={targetLanguage} aria-label="目标语言" onChange={(event) => onTargetLanguageChange(event.target.value)}><option value="">选择目标语言</option>{translationLanguages.map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}</select>}
          <div className="text-input-footer">
            <span>Ctrl+Enter 提交</span>
            <button className="text-submit-button" type="button" disabled={!textDraft.trim() || (state.action === 'translate' && !targetLanguage.trim())} onClick={onTextSubmit}>{state.action === 'ask' ? '检索' : state.action === 'translate' ? '翻译' : '转写'}</button>
          </div>
        </section>}
        {state.tag === 'error' && <div className="error-actions"><p className="error-message">{state.message}</p>{state.copyText && <button className="copy-text-button" type="button" onClick={() => onCopy(state.copyText!)}>{copyFeedback ? '已复制' : COPY_TEXT_LABEL}</button>}</div>}
        {state.tag === 'previewing' && (
          <section className={`preview-panel${previewExpanded ? ' is-expanded' : ''}`} data-testid="preview-panel">
            <button className="preview-panel-header" type="button" onClick={onPreviewToggle} aria-expanded={previewExpanded}>
              <span>{state.action === 'translate' ? '翻译结果' : '整理结果'}</span><span>{previewExpanded ? '收起⌃' : '展开⌄'}</span>
            </button>
            <p className="preview-text">{previewExpanded ? state.text : `${state.text.slice(0, 34)}${state.text.length > 34 ? '…' : ''}`}</p>
            {previewExpanded && <p className="preview-hint">{state.action === 'translate' ? '翻译结果仅供预览，当前版本不会自动写回输入框' : '文本已整理，当前版本尚未写回输入框'}</p>}
            {previewExpanded && typeof state.durationMs === 'number' && <p className="preview-duration">处理耗时：{formatDuration(state.durationMs)}</p>}
            <button className="copy-text-button preview-copy-button" type="button" onClick={() => onCopy(state.text)}>{copyFeedback ? '已复制' : '复制文本'}</button>
          </section>
        )}
        {state.tag === 'showingAnswer' && (
          <section className="retrieval-panel" data-testid="retrieval-panel">
            <header className="retrieval-panel-header"><span>检索结果</span><button type="button" onClick={() => onCopy(state.text)}>{copyFeedback ? '已复制' : '复制答案'}</button></header>
            <p className="retrieval-answer">{state.text}</p>
            {!!state.sources?.length && <section className="retrieval-sources"><h3>来源</h3>{state.sources.map((source, index) => <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer"><strong>[{index + 1}] {source.title}</strong><span>{source.sourceName ?? source.url}</span></a>)}</section>}
          </section>
        )}
      </section>
    </main>
  );
}
