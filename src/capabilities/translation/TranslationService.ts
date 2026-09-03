import type { LlmProvider } from '../../infrastructure/providers/llm/LlmProvider';

export type TranslationRequest = {
  sourceText: string;
  targetLanguage: string;
  sourceLanguage?: string;
  instruction?: string;
};

export type TranslationResult = {
  text: string;
};

export class TranslationService {
  constructor(private readonly provider: LlmProvider, private readonly model: string) {}

  async translate(request: TranslationRequest, signal?: AbortSignal): Promise<TranslationResult> {
    const sourceText = request.sourceText.trim();
    const targetLanguage = request.targetLanguage.trim();
    if (!sourceText) throw new Error('翻译内容不能为空');
    if (!targetLanguage) throw new Error('翻译任务需要目标语言');

    const sourceLanguage = request.sourceLanguage?.trim();
    const languageHint = sourceLanguage ? `源语言：${sourceLanguage}\n` : '';
    const instruction = request.instruction?.trim();
    const instructionHint = instruction ? `\n额外翻译指令：${instruction}` : '';
    const response = await this.provider.generate({
      model: this.model,
      messages: [
        { role: 'system', content: '你是一个准确、克制的翻译助手。' },
        {
          role: 'user',
          content: `将以下内容翻译成${targetLanguage}。\n${languageHint}保留原意；保留语气和格式；不添加解释；只返回翻译结果。${instructionHint}\n\n原文：\n${sourceText}`,
        },
      ],
      temperature: 0.2,
    }, signal);

    const text = response.text.trim();
    if (!text) throw new Error('LLM 未返回有效翻译');
    return { text };
  }
}
