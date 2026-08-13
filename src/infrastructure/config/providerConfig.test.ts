import { describe, expect, it } from 'vitest';
import { clearAsrConfig, loadAsrConfig, saveAsrConfig, type AsrConfig } from './providerConfig';

describe('provider config storage', () => {
  it('round-trips the ASR configuration without changing it', () => {
    const config: AsrConfig = {
      providerId: 'groq-whisper',
      baseUrl: 'https://api.groq.com/openai/v1',
      model: 'whisper-large-v3-turbo',
      apiKey: 'secret',
    };

    saveAsrConfig(config);

    expect(loadAsrConfig()).toEqual(config);
  });

  it('clears saved credentials', () => {
    saveAsrConfig({ providerId: 'openai-transcribe', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini-transcribe', apiKey: 'secret' });
    clearAsrConfig();
    expect(loadAsrConfig()).toBeUndefined();
  });
});
