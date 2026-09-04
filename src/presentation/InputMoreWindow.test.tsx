import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { TranslationLanguage } from '../infrastructure/config/translationConfig';
import { InputMoreWindow } from './InputMoreWindow';

const languages: TranslationLanguage[] = [
  { code: 'en-US', label: '英语（美国）' },
  { code: 'zh-CN', label: '简体中文' },
];

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
