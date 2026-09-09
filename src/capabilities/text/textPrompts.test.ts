import { describe, expect, it } from 'vitest';
import { buildAskPrompt, buildEnhancePrompt, TEXT_SYSTEM_PROMPT } from './textPrompts';

describe('text prompts', () => {
  it('builds the clear and directly usable enhance prompt', () => {
    expect(TEXT_SYSTEM_PROMPT).toContain('理解用户真正想表达的意思');
    expect(TEXT_SYSTEM_PROMPT).toContain('不改变核心意图、不编造事实');
    expect(TEXT_SYSTEM_PROMPT).toContain('清晰、完整、自然且可直接使用');
    expect(buildEnhancePrompt()).toContain('可以重新组织结构、改善措辞');
    expect(buildEnhancePrompt()).toContain('适度补全原文已经隐含的逻辑');
    expect(buildEnhancePrompt()).toContain('可以自然结构化');
    expect(buildEnhancePrompt()).toContain('不要回答其中的问题');
    expect(buildEnhancePrompt()).toContain('只返回优化后的内容');
  });

  it('builds the direct-answer prompt separately from enhance', () => {
    expect(buildAskPrompt()).toContain('直接回答用户的问题');
    expect(buildAskPrompt()).not.toContain('去除口头禅');
    expect(TEXT_SYSTEM_PROMPT).toContain('桌面输入增强助手');
  });
});
