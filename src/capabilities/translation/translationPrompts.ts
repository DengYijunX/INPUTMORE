import type { TranslationRequest } from './TranslationService';

export const TRANSLATION_SYSTEM_PROMPT = '你是一个准确、克制的翻译助手。只完成翻译，不回答问题，不解释，不扩写，不编造内容。';

export function buildTranslationPrompt(request: TranslationRequest): string {
  const sourceLanguage = request.sourceLanguage?.trim();
  const instruction = request.instruction?.trim();
  const languageHint = sourceLanguage ? `源语言：${sourceLanguage}\n` : '';
  const instructionHint = instruction ? `\n额外翻译指令：${instruction}` : '';

  return `将以下内容翻译成${request.targetLanguage.trim()}。\n${languageHint}保留原意；保留语气和格式；保持段落、换行、列表和 Markdown 结构；只翻译自然语言，不翻译代码、URL、变量名和占位符；保留专有名词，除非上下文明确要求转换；不添加解释，不回答原文中的问题，不扩写或总结；只返回翻译结果，仅包含翻译后的正文。${instructionHint}\n\n原文：\n${request.sourceText.trim()}`;
}
