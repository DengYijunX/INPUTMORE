import { describe, expect, it, vi } from 'vitest';
import { runTranslationFlow, type TranslationRunner } from './translationFlow';

const request = { sourceText: '你好', targetLanguage: 'English' };

describe('runTranslationFlow', () => {
  it('rejects empty input and target language before calling the runner', async () => {
    const runner: TranslationRunner = { translate: vi.fn() };

    await expect(runTranslationFlow({ sourceText: ' ', targetLanguage: 'English' }, runner)).rejects.toThrow('翻译内容不能为空');
    await expect(runTranslationFlow({ sourceText: '你好', targetLanguage: ' ' }, runner)).rejects.toThrow('目标语言');
    expect(runner.translate).not.toHaveBeenCalled();
  });

  it('trims the request and forwards the AbortSignal', async () => {
    const runner: TranslationRunner = { translate: vi.fn().mockResolvedValue({ text: 'Hello' }) };
    const controller = new AbortController();

    await expect(runTranslationFlow({ sourceText: '  你好  ', targetLanguage: ' English ' }, runner, controller.signal))
      .resolves.toEqual({ text: 'Hello' });
    expect(runner.translate).toHaveBeenCalledWith({ sourceText: '你好', targetLanguage: 'English' }, controller.signal);
  });

  it('returns no result when the request is no longer current', async () => {
    const runner: TranslationRunner = { translate: vi.fn().mockResolvedValue({ text: 'old result' }) };

    await expect(runTranslationFlow(request, runner, undefined, () => false)).resolves.toBeUndefined();
  });

  it('preserves provider errors for the application boundary to map', async () => {
    const runner: TranslationRunner = { translate: vi.fn().mockRejectedValue(new Error('模型请求失败')) };

    await expect(runTranslationFlow(request, runner)).rejects.toThrow('模型请求失败');
  });
});
