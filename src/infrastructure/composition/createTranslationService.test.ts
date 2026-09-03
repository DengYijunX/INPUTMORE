import { describe, expect, it } from 'vitest';
import { clearLlmConfig, saveLlmConfig } from '../config/providerConfig';
import { createConfiguredTranslationService } from './createTranslationService';

describe('createConfiguredTranslationService', () => {
  it('reports missing LLM configuration without constructing a usable service', () => {
    clearLlmConfig();

    expect(createConfiguredTranslationService()).toEqual({
      ok: false,
      message: '翻译需要先配置 LLM Provider',
    });
  });

  it('creates a translation service from the existing LLM configuration', () => {
    saveLlmConfig({ providerId: 'deepseek', baseUrl: 'https://api.deepseek.com', model: 'deepseek-v4-flash', apiKey: 'secret' });

    expect(createConfiguredTranslationService().ok).toBe(true);
    clearLlmConfig();
  });
});
