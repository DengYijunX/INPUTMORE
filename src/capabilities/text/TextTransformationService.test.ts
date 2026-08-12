import { describe, expect, it } from 'vitest';
import { TextTransformationService } from './TextTransformationService';
import type { LlmProvider, LlmRequest, LlmResponse } from '../../infrastructure/providers/llm/LlmProvider';

class RecordingProvider implements LlmProvider {
  lastRequest!: LlmRequest;

  async generate(request: LlmRequest): Promise<LlmResponse> {
    this.lastRequest = request;
    return { text: '模型结果' };
  }
}

describe('TextTransformationService', () => {
  it('asks the active model for conservative transcription enhancement', async () => {
    const provider = new RecordingProvider();
    const service = new TextTransformationService(provider, 'configured-model');

    await service.transform({ action: 'enhance', sourceText: '嗯这个方案再看一下' });

    expect(provider.lastRequest.model).toBe('configured-model');
    expect(provider.lastRequest.messages.at(-1)?.content).toContain('保留原意');
    expect(provider.lastRequest.messages.at(-1)?.content).toContain('只返回处理后的文本');
  });

  it('requires a target language for translation', async () => {
    const provider = new RecordingProvider();
    const service = new TextTransformationService(provider, 'configured-model');

    await service.transform({ action: 'translate', sourceText: '你好', targetLanguage: 'English' });

    expect(provider.lastRequest.messages.at(-1)?.content).toContain('English');
    expect(provider.lastRequest.messages.at(-1)?.content).toContain('只返回翻译结果');
  });

  it('uses a direct answer prompt for Ask', async () => {
    const provider = new RecordingProvider();
    const service = new TextTransformationService(provider, 'configured-model');

    await service.transform({ action: 'ask', sourceText: '什么是闭包？' });

    expect(provider.lastRequest.messages.at(-1)?.content).toContain('直接回答');
    expect(provider.lastRequest.messages.at(-1)?.content).not.toContain('去除口头禅');
  });

  it('rejects translation without a target language', async () => {
    const provider = new RecordingProvider();
    const service = new TextTransformationService(provider, 'configured-model');

    await expect(service.transform({ action: 'translate', sourceText: '你好' }))
      .rejects.toThrow('目标语言');
  });
});
