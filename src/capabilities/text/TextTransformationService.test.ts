import { describe, expect, it } from 'vitest';
import { TextTransformationService } from './TextTransformationService';
import type { LlmProvider, LlmRequest, LlmResponse } from '../../infrastructure/providers/llm/LlmProvider';

class RecordingProvider implements LlmProvider {
  lastRequest!: LlmRequest;
  calls = 0;

  async generate(request: LlmRequest): Promise<LlmResponse> {
    this.calls += 1;
    this.lastRequest = request;
    return { text: '模型结果' };
  }
}

describe('TextTransformationService', () => {
  it('returns raw input without calling the model for rawWrite', async () => {
    const provider = new RecordingProvider();
    const service = new TextTransformationService(provider, 'configured-model');

    await expect(service.transform({ action: 'rawWrite', sourceText: '原始内容' }))
      .resolves.toEqual({ text: '原始内容' });
    expect(provider.lastRequest).toBeUndefined();
  });

  it('asks the active model for conservative transcription enhancement', async () => {
    const provider = new RecordingProvider();
    const service = new TextTransformationService(provider, 'configured-model');

    await service.transform({ action: 'enhance', sourceText: '嗯这个方案再看一下' });

    expect(provider.lastRequest.model).toBe('configured-model');
    expect(provider.lastRequest.messages.at(-1)?.content).toContain('保留原意');
    expect(provider.lastRequest.messages.at(-1)?.content).toContain('只返回处理后的文本');
    expect(provider.calls).toBe(1);
  });

  it.each([
    ['short text', '请把这句话整理一下。'],
    ['long text', '这是一段较长的测试文本。'.repeat(80)],
  ])('calls the model once for %s', async (_label, sourceText) => {
    const provider = new RecordingProvider();
    const service = new TextTransformationService(provider, 'configured-model');

    await service.transform({ action: 'enhance', sourceText });

    expect(provider.calls).toBe(1);
  });

  it('uses a direct answer prompt for Ask', async () => {
    const provider = new RecordingProvider();
    const service = new TextTransformationService(provider, 'configured-model');

    await service.transform({ action: 'ask', sourceText: '什么是闭包？' });

    expect(provider.lastRequest.messages.at(-1)?.content).toContain('直接回答');
    expect(provider.lastRequest.messages.at(-1)?.content).not.toContain('去除口头禅');
  });

});
