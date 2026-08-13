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

  it('keeps ASR presets OpenAI-compatible for the first MVP', () => {
    expect(PROVIDER_PRESETS.filter((preset) => preset.kind === 'asr')).toHaveLength(2);
    expect(getProviderPreset('groq-whisper')?.baseUrl).toContain('/openai/v1');
  });
});
