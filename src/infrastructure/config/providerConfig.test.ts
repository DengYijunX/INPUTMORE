import { describe, expect, it } from 'vitest';
import { clearAsrConfig, clearLlmConfig, loadAsrConfig, loadLlmConfig, loadRawWriteLlmEnabled, saveAsrConfig, saveLlmConfig, saveRawWriteLlmEnabled, type AsrConfig, type LlmConfig } from './providerConfig';

describe('provider config storage', () => {
  it('round-trips the ASR configuration without changing it', () => {
    const config: AsrConfig = {
      providerId: 'groq-whisper',
      baseUrl: 'https://api.groq.com/openai/v1',
      model: 'whisper-large-v3-turbo',
      apiKey: 'secret',
      workspaceId: '',
    };

    saveAsrConfig(config);

    expect(loadAsrConfig()).toEqual(config);
  });

  it('clears saved credentials', () => {
    saveAsrConfig({ providerId: 'openai-transcribe', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini-transcribe', apiKey: 'secret' });
    clearAsrConfig();
    expect(loadAsrConfig()).toBeUndefined();
  });

  it('round-trips the LLM configuration separately from ASR', () => {
    const config: LlmConfig = { providerId: 'deepseek', baseUrl: 'https://api.deepseek.com', model: 'deepseek-v4-flash', apiKey: 'secret' };
    saveLlmConfig(config);
    expect(loadLlmConfig()).toEqual(config);
    clearLlmConfig();
    expect(loadLlmConfig()).toBeUndefined();
  });

  it('defaults rawWrite LLM enhancement to off and persists the toggle', () => {
    expect(loadRawWriteLlmEnabled()).toBe(false);
    saveRawWriteLlmEnabled(true);
    expect(loadRawWriteLlmEnabled()).toBe(true);
    saveRawWriteLlmEnabled(false);
    expect(loadRawWriteLlmEnabled()).toBe(false);
  });
});
