import { describe, expect, it, vi } from 'vitest';
import { ProviderError } from '../llm/LlmProvider';
import { ZhipuWebSearch } from './ZhipuWebSearch';

describe('ZhipuWebSearch', () => {
  it('sends the query and normalizes structured search results', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      search_result: [{
        title: '智谱搜索',
        content: '搜索摘要',
        link: 'https://example.test/result',
        media: 'Example',
        publish_date: '2026-08-18',
      }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const provider = new ZhipuWebSearch({ apiKey: 'test-key', fetcher: fetcher as unknown as typeof fetch });

    await expect(provider.search('最新 AI 新闻')).resolves.toEqual([{
      title: '智谱搜索',
      url: 'https://example.test/result',
      snippet: '搜索摘要',
      sourceName: 'Example',
      publishedAt: '2026-08-18',
    }]);
    expect(fetcher).toHaveBeenCalledWith('https://open.bigmodel.cn/api/paas/v4/web_search', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer test-key' }),
    }));
    expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toMatchObject({
      search_query: '最新 AI 新闻',
      search_engine: 'search_std',
      count: 5,
      content_size: 'medium',
    });
  });

  it('rejects unauthorized responses with a provider error', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('{}', { status: 401 }));
    const provider = new ZhipuWebSearch({ apiKey: 'bad-key', fetcher: fetcher as unknown as typeof fetch });

    await expect(provider.search('query')).rejects.toMatchObject({ code: 'provider_unauthorized' } satisfies Partial<ProviderError>);
  });

  it('rejects invalid result payloads instead of returning malformed sources', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ search_result: [{ title: '缺少链接' }] }), { status: 200 }));
    const provider = new ZhipuWebSearch({ apiKey: 'test-key', fetcher: fetcher as unknown as typeof fetch });

    await expect(provider.search('query')).rejects.toMatchObject({ code: 'provider_invalid_response' } satisfies Partial<ProviderError>);
  });
});
