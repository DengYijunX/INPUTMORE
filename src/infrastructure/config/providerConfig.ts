const ASR_CONFIG_KEY = 'inputmore.asr.config';
const LLM_CONFIG_KEY = 'inputmore.llm.config';

export type AsrConfig = {
  providerId: string;
  baseUrl: string;
  model: string;
  apiKey: string;
  workspaceId?: string;
};

export type LlmConfig = {
  providerId: string;
  baseUrl: string;
  model: string;
  apiKey: string;
};

export function loadAsrConfig(): AsrConfig | undefined {
  const raw = localStorage.getItem(ASR_CONFIG_KEY);
  if (!raw) return undefined;
  try {
    const value = JSON.parse(raw) as Partial<AsrConfig>;
    if ([value.providerId, value.baseUrl, value.model, value.apiKey].some((item) => typeof item !== 'string')) return undefined;
    return value as AsrConfig;
  } catch {
    return undefined;
  }
}

export function saveAsrConfig(config: AsrConfig): void {
  localStorage.setItem(ASR_CONFIG_KEY, JSON.stringify(config));
}

export function clearAsrConfig(): void {
  localStorage.removeItem(ASR_CONFIG_KEY);
}

export function loadLlmConfig(): LlmConfig | undefined {
  const raw = localStorage.getItem(LLM_CONFIG_KEY);
  if (!raw) return undefined;
  try {
    const value = JSON.parse(raw) as Partial<LlmConfig>;
    if ([value.providerId, value.baseUrl, value.model, value.apiKey].some((item) => typeof item !== 'string')) return undefined;
    return value as LlmConfig;
  } catch {
    return undefined;
  }
}

export function saveLlmConfig(config: LlmConfig): void {
  localStorage.setItem(LLM_CONFIG_KEY, JSON.stringify(config));
}

export function clearLlmConfig(): void {
  localStorage.removeItem(LLM_CONFIG_KEY);
}
