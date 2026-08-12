export type LlmMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type LlmRequest = {
  model: string;
  messages: LlmMessage[];
  temperature?: number;
  maxTokens?: number;
};

export type LlmResponse = {
  text: string;
  citations?: string[];
};

export interface LlmProvider {
  generate(request: LlmRequest, signal?: AbortSignal): Promise<LlmResponse>;
}

export type ProviderErrorCode =
  | 'provider_unauthorized'
  | 'provider_unavailable'
  | 'provider_invalid_response'
  | 'provider_request_failed';

export class ProviderError extends Error {
  constructor(public readonly code: ProviderErrorCode, message: string) {
    super(message);
    this.name = 'ProviderError';
  }
}
