import type { LlmProvider } from '../../infrastructure/providers/llm/LlmProvider';
import type { SearchProvider, SearchResult } from './SearchProvider';
import { buildRetrievalPrompt, formatRetrievalSources, RETRIEVAL_SYSTEM_PROMPT } from './retrievalPrompts';

export type RetrievalResult = {
  answer: string;
  sources: SearchResult[];
};

export class RetrievalService {
  constructor(private readonly dependencies: {
    search: SearchProvider;
    llm: LlmProvider;
    model: string;
  }) {}

  async retrieve(query: string, signal?: AbortSignal): Promise<RetrievalResult> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) throw new Error('检索内容不能为空');

    const sources = await this.dependencies.search.search(normalizedQuery, signal);
    if (sources.length === 0) throw new Error('未找到相关结果');

    const response = await this.dependencies.llm.generate({
      model: this.dependencies.model,
      messages: [
        {
          role: 'system',
            content: RETRIEVAL_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: buildRetrievalPrompt(normalizedQuery, formatRetrievalSources(sources)),
        },
      ],
      temperature: 0.2,
      maxTokens: 800,
    }, signal);

    const answer = response.text.trim();
    if (!answer) throw new Error('LLM 未返回有效检索答案');
    return { answer, sources };
  }
}
