import { describe, expect, it } from 'vitest';
import { TranslationService, type TranslationRequest } from './TranslationService';
import type { LlmProvider, LlmRequest, LlmResponse } from '../../infrastructure/providers/llm/LlmProvider';

class RecordingProvider implements LlmProvider {
  calls = 0;
  requests: LlmRequest[] = [];
  response: LlmResponse = { text: '  translated text  ' };

  async generate(request: LlmRequest, signal?: AbortSignal): Promise<LlmResponse> {
    this.calls += 1;
    this.requests.push(request);
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    return this.response;
  }
}

const request: TranslationRequest = {
  sourceText: '  你好，世界。  ',
  targetLanguage: 'English',
};

describe('TranslationService', () => {
  it('translates once through the abstract LLM provider', async () => {
    const provider = new RecordingProvider();
    const service = new TranslationService(provider, 'configured-model');

    await expect(service.translate(request)).resolves.toEqual({ text: 'translated text' });
    expect(provider.calls).toBe(1);
    expect(provider.requests[0].model).toBe('configured-model');
  });

  it('requires a non-empty source text before calling the provider', async () => {
    const provider = new RecordingProvider();
    const service = new TranslationService(provider, 'configured-model');

    await expect(service.translate({ ...request, sourceText: '  ' })).rejects.toThrow('翻译内容不能为空');
    expect(provider.calls).toBe(0);
  });

  it('requires a non-empty target language before calling the provider', async () => {
    const provider = new RecordingProvider();
    const service = new TranslationService(provider, 'configured-model');

    await expect(service.translate({ ...request, targetLanguage: '  ' })).rejects.toThrow('目标语言');
    expect(provider.calls).toBe(0);
  });

  it('asks the model to preserve meaning, tone, and format without explanation', async () => {
    const provider = new RecordingProvider();
    const service = new TranslationService(provider, 'configured-model');

    await service.translate({ ...request, sourceLanguage: 'Chinese', instruction: 'Use natural business English.' });

    const prompt = provider.requests[0].messages.at(-1)?.content ?? '';
    expect(prompt).toContain('保留原意');
    expect(prompt).toContain('语气和格式');
    expect(prompt).toContain('不添加解释');
    expect(prompt).toContain('只返回翻译结果');
    expect(prompt).toContain('Chinese');
    expect(prompt).toContain('Use natural business English.');
  });

  it('forwards cancellation to the provider', async () => {
    const provider = new RecordingProvider();
    const service = new TranslationService(provider, 'configured-model');
    const controller = new AbortController();
    controller.abort();

    await expect(service.translate(request, controller.signal)).rejects.toThrow('Aborted');
    expect(provider.calls).toBe(1);
  });

  it('rejects an empty provider response', async () => {
    const provider = new RecordingProvider();
    provider.response = { text: '   ' };
    const service = new TranslationService(provider, 'configured-model');

    await expect(service.translate(request)).rejects.toThrow('有效翻译');
  });
});
