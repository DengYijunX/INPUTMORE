export const TEXT_SYSTEM_PROMPT = '你是一个谨慎的桌面输入增强助手。';

export function buildEnhancePrompt(): string {
  return '优化这段语音转写：去除口头禅和明显重复，补充标点并修正明显语病。保留原意、事实和语气，不总结、不扩写、不回答问题，只返回处理后的文本。';
}

export function buildAskPrompt(): string {
  return '直接回答用户的问题。基于提供的内容作答，不要把问题改写成 Prompt。';
}
