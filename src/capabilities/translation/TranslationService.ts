import type { LlmProvider } from '../../infrastructure/providers/llm/LlmProvider';
import { buildTranslationPrompt, TRANSLATION_SYSTEM_PROMPT } from './translationPrompts';

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

    const response = await this.provider.generate({
      model: this.model,
      messages: [
        { role: 'system', content: TRANSLATION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: buildTranslationPrompt({ ...request, sourceText, targetLanguage }),
        },
      ],
      temperature: 0.2,
    }, signal);

    const text = response.text.trim();
    if (!text) throw new Error('LLM 未返回有效翻译');
    return { text };
  }
}
