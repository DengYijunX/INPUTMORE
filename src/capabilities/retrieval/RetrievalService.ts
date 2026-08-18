import type { LlmProvider } from '../../infrastructure/providers/llm/LlmProvider';
import type { SearchProvider, SearchResult } from './SearchProvider';

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
          content: '你是一个谨慎的网页检索问答助手。只能基于提供的来源回答，不要编造事实；在相关陈述后使用 [1]、[2] 等标注来源；如果来源不足以支持结论，要明确说明。只返回答案正文。',
        },
        {
          role: 'user',
          content: `${normalizedQuery}\n\n可用来源：\n${formatSources(sources)}`,
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

function formatSources(sources: SearchResult[]): string {
  return sources.map((source, index) => [
    `[${index + 1}] ${source.title}`,
    source.url,
    source.snippet,
  ].join('\n')).join('\n\n');
}
