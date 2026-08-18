import { describe, expect, it } from 'vitest';
import type { SearchProvider, SearchResult } from './SearchProvider';

describe('SearchProvider contract', () => {
  it('describes normalized web search results', () => {
    const result: SearchResult = {
      title: 'Example',
      url: 'https://example.test',
      snippet: 'A short result summary',
      sourceName: 'Example',
      publishedAt: '2026-08-18',
    };
    const provider: SearchProvider = { search: async () => [result] };

    expect(provider.search).toBeTypeOf('function');
    expect(result.url).toBe('https://example.test');
  });
});
