import { ProviderError, type LlmProvider, type LlmRequest, type LlmResponse } from './LlmProvider';

type Fetcher = typeof fetch;

export class OpenAICompatibleLlm implements LlmProvider {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly fetcher: Fetcher;

  constructor(config: { baseUrl: string; apiKey: string; fetcher?: Fetcher }) {
    if (!config.baseUrl.trim()) throw new Error('Provider base URL is required');
    if (!config.apiKey.trim()) throw new Error('Provider API key is required');
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.fetcher = config.fetcher ?? globalThis.fetch.bind(globalThis);
  }

  async generate(request: LlmRequest, signal?: AbortSignal): Promise<LlmResponse> {
    const response = await this.fetcher(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
      }),
      signal,
    });

    if (response.status === 401 || response.status === 403) {
      throw new ProviderError('provider_unauthorized', 'Provider API key is invalid');
    }
    if (!response.ok) {
      throw new ProviderError('provider_request_failed', `Provider returned HTTP ${response.status}`);
    }

    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const text = payload.choices?.[0]?.message?.content;
    if (typeof text !== 'string') {
      throw new ProviderError('provider_invalid_response', 'Provider response did not contain text');
    }
    return { text };
  }
}
