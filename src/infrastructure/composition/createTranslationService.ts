import { TranslationService } from '../../capabilities/translation/TranslationService';
import { loadLlmConfig } from '../config/providerConfig';
import { OpenAICompatibleLlm } from '../providers/llm/OpenAICompatibleLlm';

export type TranslationServiceConfiguration =
  | { ok: true; service: TranslationService }
  | { ok: false; message: string };

export function createConfiguredTranslationService(): TranslationServiceConfiguration {
  const llmConfig = loadLlmConfig();
  if (!llmConfig) return { ok: false, message: '翻译需要先配置 LLM Provider' };

  return {
    ok: true,
    service: new TranslationService(new OpenAICompatibleLlm(llmConfig), llmConfig.model),
  };
}
