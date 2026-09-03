import type { TranslationRequest, TranslationResult } from '../capabilities/translation/TranslationService';

export interface TranslationRunner {
  translate(request: TranslationRequest, signal?: AbortSignal): Promise<TranslationResult>;
}

export async function runTranslationFlow(
  request: TranslationRequest,
  runner: TranslationRunner,
  signal?: AbortSignal,
  isCurrent: () => boolean = () => true,
): Promise<TranslationResult | undefined> {
  const normalizedRequest: TranslationRequest = {
    ...request,
    sourceText: request.sourceText.trim(),
    targetLanguage: request.targetLanguage.trim(),
    ...(request.sourceLanguage?.trim() ? { sourceLanguage: request.sourceLanguage.trim() } : {}),
    ...(request.instruction?.trim() ? { instruction: request.instruction.trim() } : {}),
  };
  if (!normalizedRequest.sourceText) throw new Error('翻译内容不能为空');
  if (!normalizedRequest.targetLanguage) throw new Error('翻译任务需要目标语言');

  const result = await runner.translate(normalizedRequest, signal);
  if (signal?.aborted || !isCurrent()) return undefined;
  return result;
}
