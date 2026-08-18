import { describe, expect, it } from 'vitest';
import type { LlmProvider, LlmRequest, LlmResponse } from '../../infrastructure/providers/llm/LlmProvider';
import type { SearchProvider, SearchResult } from './SearchProvider';
import { RetrievalService } from './RetrievalService';

const results: SearchResult[] = [{
  title: '网页标题',
  url: 'https://example.test/article',
  snippet: '网页摘要内容',
  sourceName: 'Example',
  publishedAt: '2026-08-18',
}];

class FakeSearchProvider implements SearchProvider {
  calls = 0;
  signal?: AbortSignal;

  async search(_query: string, signal?: AbortSignal): Promise<SearchResult[]> {
    this.calls += 1;
    this.signal = signal;
    return results;
  }
}

class FakeLlmProvider implements LlmProvider {
  calls = 0;
  lastRequest?: LlmRequest;
  signal?: AbortSignal;

  async generate(request: LlmRequest, signal?: AbortSignal): Promise<LlmResponse> {
    this.calls += 1;
    this.lastRequest = request;
    this.signal = signal;
    return { text: '基于来源整理出的答案' };
  }
}

describe('RetrievalService', () => {
  it('searches once and asks the model once with source context', async () => {
    const search = new FakeSearchProvider();
    const llm = new FakeLlmProvider();
    const service = new RetrievalService({ search, llm, model: 'configured-model' });

    await expect(service.retrieve('网页检索问题')).resolves.toEqual({
      answer: '基于来源整理出的答案',
      sources: results,
    });
    expect(search.calls).toBe(1);
    expect(llm.calls).toBe(1);
    expect(llm.lastRequest?.model).toBe('configured-model');
    expect(llm.lastRequest?.messages.at(-1)?.content).toContain('网页摘要内容');
    expect(llm.lastRequest?.messages.at(-1)?.content).toContain('https://example.test/article');
  });

  it('rejects blank queries before searching', async () => {
    const search = new FakeSearchProvider();
    const llm = new FakeLlmProvider();
    const service = new RetrievalService({ search, llm, model: 'configured-model' });

    await expect(service.retrieve('   ')).rejects.toThrow('检索内容不能为空');
    expect(search.calls).toBe(0);
    expect(llm.calls).toBe(0);
  });

  it('rejects empty search results without calling the model', async () => {
    const search: SearchProvider = { search: async () => [] };
    const llm = new FakeLlmProvider();
    const service = new RetrievalService({ search, llm, model: 'configured-model' });

    await expect(service.retrieve('没有结果的问题')).rejects.toThrow('未找到相关结果');
    expect(llm.calls).toBe(0);
  });

  it('forwards cancellation to both providers', async () => {
    const search = new FakeSearchProvider();
    const llm = new FakeLlmProvider();
    const service = new RetrievalService({ search, llm, model: 'configured-model' });
    const controller = new AbortController();

    await service.retrieve('可取消的问题', controller.signal);

    expect(search.signal).toBe(controller.signal);
    expect(llm.signal).toBe(controller.signal);
  });
});
