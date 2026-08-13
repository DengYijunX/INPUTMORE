import { describe, expect, it } from 'vitest';
import { getProviderPreset, PROVIDER_PRESETS } from './providerPresets';

describe('provider presets', () => {
  it('provides a low-cost DeepSeek preset for text enhancement', () => {
    const preset = getProviderPreset('deepseek');
    expect(preset).toMatchObject({
      kind: 'llm',
      baseUrl: 'https://api.deepseek.com',
    });
  });

  it('keeps the existing OpenAI-compatible ASR presets available', () => {
    expect(PROVIDER_PRESETS.filter((preset) => preset.kind === 'asr')).toHaveLength(4);
    expect(getProviderPreset('groq-whisper')?.baseUrl).toContain('/openai/v1');
  });

  it('describes the Alibaba Paraformer workspace requirement', () => {
    expect(getProviderPreset('aliyun-paraformer')).toMatchObject({
      kind: 'asr',
      defaultModel: 'paraformer-realtime-v2',
      requiresWorkspaceId: true,
    });
  });

  it('describes the Qwen3 ASR Flash HTTP-compatible preset', () => {
    expect(getProviderPreset('qwen3-asr-flash')).toMatchObject({
      kind: 'asr', defaultModel: 'qwen3-asr-flash', requiresWorkspaceId: true,
    });
  });
});
