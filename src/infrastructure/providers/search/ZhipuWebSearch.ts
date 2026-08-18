import { ProviderError } from '../llm/LlmProvider';
import type { SearchProvider, SearchResult } from '../../../capabilities/retrieval/SearchProvider';

type Fetcher = typeof fetch;

type ZhipuSearchRow = {
  title?: unknown;
  content?: unknown;
  link?: unknown;
  media?: unknown;
  publish_date?: unknown;
};

export class ZhipuWebSearch implements SearchProvider {
  private readonly apiKey: string;
  private readonly fetcher: Fetcher;
  private readonly endpoint: string;

  constructor(config: { apiKey: string; fetcher?: Fetcher; endpoint?: string }) {
    this.apiKey = config.apiKey;
    this.fetcher = config.fetcher ?? globalThis.fetch.bind(globalThis);
    this.endpoint = config.endpoint ?? 'https://open.bigmodel.cn/api/paas/v4/web_search';
  }

  async search(query: string, signal?: AbortSignal): Promise<SearchResult[]> {
    if (!this.apiKey.trim()) throw new ProviderError('provider_unauthorized', '智谱 Web Search API Key 未配置');
    if (!query.trim()) throw new ProviderError('provider_request_failed', '检索内容不能为空');

    const response = await this.fetcher(this.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        search_query: query.trim(),
        search_engine: 'search_std',
        search_intent: false,
        count: 5,
        content_size: 'medium',
        search_recency_filter: 'noLimit',
      }),
      signal,
    });

    if (response.status === 401 || response.status === 403) {
      throw new ProviderError('provider_unauthorized', '智谱 Web Search API Key 无效');
    }
    if (!response.ok) {
      throw new ProviderError('provider_request_failed', `智谱 Web Search 请求失败（HTTP ${response.status}）`);
    }

    let payload: { search_result?: unknown };
    try {
      payload = await response.json() as { search_result?: unknown };
    } catch {
      throw new ProviderError('provider_invalid_response', '智谱 Web Search 返回结果不是有效 JSON');
    }

    if (!Array.isArray(payload.search_result)) {
      throw new ProviderError('provider_invalid_response', '智谱 Web Search 返回结果格式无效');
    }

    const results = payload.search_result
      .map((row) => normalizeResult(row as ZhipuSearchRow))
      .filter((row): row is SearchResult => row !== undefined);
    if (payload.search_result.length > 0 && results.length === 0) {
      throw new ProviderError('provider_invalid_response', '智谱 Web Search 未返回有效网页结果');
    }
    return results;
  }
}

function normalizeResult(row: ZhipuSearchRow): SearchResult | undefined {
  if (typeof row.title !== 'string' || !row.title.trim()) return undefined;
  if (typeof row.link !== 'string' || !row.link.trim()) return undefined;
  if (typeof row.content !== 'string' || !row.content.trim()) return undefined;

  return {
    title: row.title.trim(),
    url: row.link.trim(),
    snippet: row.content.trim(),
    ...(typeof row.media === 'string' && row.media.trim() ? { sourceName: row.media.trim() } : {}),
    ...(typeof row.publish_date === 'string' && row.publish_date.trim() ? { publishedAt: row.publish_date.trim() } : {}),
  };
}
