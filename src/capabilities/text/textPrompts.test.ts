import { describe, expect, it } from 'vitest';
import { buildAskPrompt, buildEnhancePrompt, TEXT_SYSTEM_PROMPT } from './textPrompts';

describe('text prompts', () => {
  it('builds the conservative enhance prompt', () => {
    expect(buildEnhancePrompt()).toContain('保留原意、事实和语气');
    expect(buildEnhancePrompt()).toContain('不总结、不扩写、不回答问题');
    expect(buildEnhancePrompt()).toContain('只返回处理后的文本');
  });

  it('builds the direct-answer prompt separately from enhance', () => {
    expect(buildAskPrompt()).toContain('直接回答用户的问题');
    expect(buildAskPrompt()).not.toContain('去除口头禅');
    expect(TEXT_SYSTEM_PROMPT).toContain('桌面输入增强助手');
  });
});
