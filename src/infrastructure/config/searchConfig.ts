const SEARCH_CONFIG_KEY = 'inputmore.search.config';

export type SearchConfig = {
  providerId: string;
  endpoint: string;
  apiKey: string;
};

export function loadSearchConfig(): SearchConfig | undefined {
  const raw = localStorage.getItem(SEARCH_CONFIG_KEY);
  if (!raw) return undefined;
  try {
    const value = JSON.parse(raw) as Partial<SearchConfig>;
    const providerId = value.providerId;
    const endpoint = value.endpoint;
    const apiKey = value.apiKey;
    if (typeof providerId !== 'string' || !providerId.trim()) return undefined;
    if (typeof endpoint !== 'string' || !endpoint.trim()) return undefined;
    if (typeof apiKey !== 'string' || !apiKey.trim()) return undefined;
    return { providerId: providerId.trim(), endpoint: endpoint.trim(), apiKey };
  } catch {
    return undefined;
  }
}

export function saveSearchConfig(config: SearchConfig): void {
  localStorage.setItem(SEARCH_CONFIG_KEY, JSON.stringify({
    providerId: config.providerId.trim(),
    endpoint: config.endpoint.trim(),
    apiKey: config.apiKey,
  }));
}

export function clearSearchConfig(): void {
  localStorage.removeItem(SEARCH_CONFIG_KEY);
}
