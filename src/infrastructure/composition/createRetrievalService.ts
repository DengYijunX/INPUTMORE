import { RetrievalService } from '../../capabilities/retrieval/RetrievalService';
import { loadLlmConfig } from '../config/providerConfig';
import { loadSearchConfig } from '../config/searchConfig';
import { OpenAICompatibleLlm } from '../providers/llm/OpenAICompatibleLlm';
import { ZhipuWebSearch } from '../providers/search/ZhipuWebSearch';

export type RetrievalServiceConfiguration =
  | { ok: true; service: RetrievalService }
  | { ok: false; message: string };

export function createConfiguredRetrievalService(): RetrievalServiceConfiguration {
  const searchConfig = loadSearchConfig();
  const llmConfig = loadLlmConfig();
  if (!searchConfig) return { ok: false, message: '网页检索需要先配置 Search Provider' };
  if (!llmConfig) return { ok: false, message: '网页检索需要先配置 LLM Provider' };

  return {
    ok: true,
    service: new RetrievalService({
      search: new ZhipuWebSearch({ apiKey: searchConfig.apiKey, endpoint: searchConfig.endpoint }),
      llm: new OpenAICompatibleLlm(llmConfig),
      model: llmConfig.model,
    }),
  };
}
