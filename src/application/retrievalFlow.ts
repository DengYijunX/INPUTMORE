import type { RetrievalResult } from '../capabilities/retrieval/RetrievalService';

export interface RetrievalRunner {
  retrieve(query: string, signal?: AbortSignal): Promise<RetrievalResult>;
}

export async function runRetrievalFlow(query: string, runner: RetrievalRunner, signal?: AbortSignal): Promise<RetrievalResult> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) throw new Error('检索内容不能为空');
  return runner.retrieve(normalizedQuery, signal);
}
