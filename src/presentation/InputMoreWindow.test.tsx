import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import type { TranslationLanguage } from '../infrastructure/config/translationConfig';
import { InputMoreWindow } from './InputMoreWindow';

const languages: TranslationLanguage[] = [
  { code: 'en-US', label: '英语（美国）' },
  { code: 'zh-CN', label: '简体中文' },
];

const baseProps: Omit<ComponentProps<typeof InputMoreWindow>, 'state'> = {
  theme: 'dark',
  previewExpanded: false,
  copyFeedback: false,
  textDraft: '',
  targetLanguage: 'en-US',
  translationLanguages: languages,
  floatingCardRef: { current: null },
  onPreviewToggle: vi.fn(),
  onTextDraftChange: vi.fn(),
  onTargetLanguageChange: vi.fn(),
  onTextSubmit: vi.fn(),
  onStartTextRewrite: vi.fn(),
  onStartRetrieval: vi.fn(),
  onStartTranslation: vi.fn(),
  onOpenSettings: vi.fn(),
  onCancel: vi.fn(),
  onUndo: vi.fn(),
  onCopy: vi.fn(),
  onPointerDown: vi.fn(),
};

function renderIdleWindow() {
  return render(<InputMoreWindow state={{ tag: 'idle' }} {...baseProps} />);
}

function renderTranslationWindow(overrides: { textDraft?: string; targetLanguage?: string } = {}) {
  return render(<InputMoreWindow state={{ tag: 'textInput', action: 'translate', text: '' }} {...baseProps} {...overrides} />);
}

describe('translation input selector', () => {
  it('shows the current language and reports a quick language change', () => {
    const onTargetLanguageChange = vi.fn();
    render(<InputMoreWindow
      state={{ tag: 'textInput', action: 'translate', text: '' }}
      theme="dark"
      previewExpanded={false}
      copyFeedback={false}
      textDraft=""
      targetLanguage="en-US"
      translationLanguages={languages}
      floatingCardRef={{ current: null }}
      onPreviewToggle={vi.fn()}
      onTextDraftChange={vi.fn()}
      onTargetLanguageChange={onTargetLanguageChange}
      onTextSubmit={vi.fn()}
      onStartTextRewrite={vi.fn()}
      onStartTranslation={vi.fn()}
      onStartRetrieval={vi.fn()}
      onOpenSettings={vi.fn()}
      onCancel={vi.fn()}
      onUndo={vi.fn()}
      onCopy={vi.fn()}
      onPointerDown={vi.fn()}
    />);

    const selector = screen.getByRole('combobox', { name: '目标语言' });
    expect(selector).toHaveValue('en-US');
    fireEvent.change(selector, { target: { value: 'zh-CN' } });
    expect(onTargetLanguageChange).toHaveBeenCalledWith('zh-CN');
  });
});

describe('idle capability controls', () => {
  it('shows a semantic icon for each idle capability button', () => {
    renderIdleWindow();
    expect(screen.getByTestId('capability-icon-text')).toBeInTheDocument();
    expect(screen.getByTestId('capability-icon-translation')).toBeInTheDocument();
    expect(screen.getByTestId('capability-icon-retrieval')).toBeInTheDocument();
  });

  it('uses the same warm highlight for hover and keyboard focus', () => {
    renderIdleWindow();
    const button = screen.getByRole('button', { name: '翻译' });
    fireEvent.mouseEnter(button);
    expect(button).toHaveAttribute('data-interaction', 'hover');
    fireEvent.focus(button);
    expect(button).toHaveAttribute('data-interaction', 'focus');
  });
});

describe('recording state', () => {
  it('shows an animated waveform and REC status', () => {
    render(<InputMoreWindow state={{ tag: 'recording', action: 'rawWrite', startedAt: 0 }} {...baseProps} />);
    expect(screen.getByRole('status')).toHaveTextContent('REC');
    expect(screen.getByTestId('recording-waveform')).toBeInTheDocument();
  });
});

describe('floating panel boundaries', () => {
  it('keeps translation submit disabled for empty source text', () => {
    renderTranslationWindow({ textDraft: ' ', targetLanguage: 'zh-CN' });
    expect(screen.getByRole('button', { name: '翻译' })).toBeDisabled();
  });

  it('renders long preview text inside a bounded result panel', () => {
    render(<InputMoreWindow state={{ tag: 'previewing', action: 'translate', text: '长文本'.repeat(200) }} {...baseProps} />);
    const panel = screen.getByTestId('preview-panel');
    expect(panel).toHaveClass('preview-panel');
    expect(screen.getByText('翻译结果')).toBeInTheDocument();
  });

  it('renders a user-facing error without exposing provider details', () => {
    render(<InputMoreWindow state={{ tag: 'error', action: 'translate', message: '翻译失败', retryable: false }} {...baseProps} />);
    expect(screen.getByText('翻译失败')).toBeInTheDocument();
    expect(screen.queryByText(/API Key|stack|Provider response/i)).not.toBeInTheDocument();
  });

  it('renders preview content as a read-only panel with copy action', () => {
    render(<InputMoreWindow state={{ tag: 'previewing', action: 'translate', text: '翻译结果内容' }} {...baseProps} previewExpanded />);
    expect(screen.getByText('翻译结果')).toBeInTheDocument();
    expect(screen.getByText('翻译结果内容')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '复制文本' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
