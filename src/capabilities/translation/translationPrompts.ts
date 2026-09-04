import type { TranslationRequest } from './TranslationService';

export const TRANSLATION_SYSTEM_PROMPT = '你是一个准确、克制的翻译助手。';

export function buildTranslationPrompt(request: TranslationRequest): string {
  const sourceLanguage = request.sourceLanguage?.trim();
  const instruction = request.instruction?.trim();
  const languageHint = sourceLanguage ? `源语言：${sourceLanguage}\n` : '';
  const instructionHint = instruction ? `\n额外翻译指令：${instruction}` : '';

  return `将以下内容翻译成${request.targetLanguage.trim()}。\n${languageHint}保留原意；保留语气和格式；不添加解释；只返回翻译结果。${instructionHint}\n\n原文：\n${request.sourceText.trim()}`;
}
