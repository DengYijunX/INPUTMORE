import { describe, expect, it } from 'vitest';
import { buildTranslationPrompt, TRANSLATION_SYSTEM_PROMPT } from './translationPrompts';

describe('translation prompts', () => {
  it('includes the target language and translation constraints', () => {
    const prompt = buildTranslationPrompt({
      sourceText: '你好',
      targetLanguage: 'English',
      sourceLanguage: 'Chinese',
      instruction: 'Use natural business English.',
    });

    expect(prompt).toContain('English');
    expect(prompt).toContain('Chinese');
    expect(prompt).toContain('保留原意');
    expect(prompt).toContain('保留语气和格式');
    expect(prompt).toContain('不添加解释');
    expect(prompt).toContain('只返回翻译结果');
    expect(prompt).toContain('Use natural business English.');
    expect(TRANSLATION_SYSTEM_PROMPT).toContain('翻译助手');
  });

  it('preserves structured technical content and returns translation only', () => {
    const prompt = buildTranslationPrompt({
      sourceText: '请运行 `npm install`，然后访问 https://example.com。',
      targetLanguage: 'English',
    });

    expect(prompt).toContain('段落、换行、列表和 Markdown 结构');
    expect(prompt).toContain('代码、URL、变量名和占位符');
    expect(prompt).toContain('专有名词');
    expect(prompt).toContain('翻译后的正文');
  });

  it('keeps optional source language and instruction separate from core rules', () => {
    const prompt = buildTranslationPrompt({
      sourceText: '原文',
      targetLanguage: 'English',
      sourceLanguage: 'Chinese',
      instruction: 'Use a concise product tone.',
    });

    expect(prompt).toContain('源语言：Chinese');
    expect(prompt).toContain('额外翻译指令：Use a concise product tone.');
    expect(prompt.indexOf('额外翻译指令：')).toBeGreaterThan(prompt.indexOf('只返回翻译后的正文'));
  });
});
