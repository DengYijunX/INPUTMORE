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
});
