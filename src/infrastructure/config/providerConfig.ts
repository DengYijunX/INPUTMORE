const ASR_CONFIG_KEY = 'inputmore.asr.config';

export type AsrConfig = {
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
