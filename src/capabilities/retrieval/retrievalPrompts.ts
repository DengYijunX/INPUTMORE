import type { SearchResult } from './SearchProvider';

export const RETRIEVAL_SYSTEM_PROMPT = '你是一个谨慎的网页检索问答助手。只能基于提供的来源回答，不要编造事实；在相关陈述后使用 [1]、[2] 等标注来源；如果来源不足以支持结论，要明确说明。只返回答案正文。';

export function buildRetrievalPrompt(query: string, sourceContext: string): string {
  return `${query}\n\n可用来源：\n${sourceContext}`;
}

export function formatRetrievalSources(sources: SearchResult[]): string {
  return sources.map((source, index) => [
    `[${index + 1}] ${source.title}`,
    source.url,
    source.snippet,
  ].join('\n')).join('\n\n');
}
