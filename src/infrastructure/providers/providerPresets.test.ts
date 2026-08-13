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
    expect(PROVIDER_PRESETS.filter((preset) => preset.kind === 'asr')).toHaveLength(3);
    expect(getProviderPreset('groq-whisper')?.baseUrl).toContain('/openai/v1');
  });

  it('describes the Alibaba Paraformer workspace requirement', () => {
    expect(getProviderPreset('aliyun-paraformer')).toMatchObject({
      kind: 'asr',
      defaultModel: 'paraformer-realtime-v2',
      requiresWorkspaceId: true,
    });
  });
});
