import { describe, expect, it } from 'vitest';
import { buildRetrievalPrompt, RETRIEVAL_SYSTEM_PROMPT } from './retrievalPrompts';

describe('retrieval prompts', () => {
  it('keeps source context and citation rules in the retrieval prompt', () => {
    const prompt = buildRetrievalPrompt('什么是闭包？', '[1] 文档\nhttps://example.test\n闭包说明');

    expect(prompt).toContain('什么是闭包？');
    expect(prompt).toContain('[1] 文档');
    expect(prompt).toContain('https://example.test');
    expect(RETRIEVAL_SYSTEM_PROMPT).toContain('只能基于提供的来源回答');
    expect(RETRIEVAL_SYSTEM_PROMPT).toContain('[1]、[2]');
  });
});
