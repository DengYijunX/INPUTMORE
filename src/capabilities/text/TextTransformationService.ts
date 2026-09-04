import type { LlmProvider } from '../../infrastructure/providers/llm/LlmProvider';
import type { TextTransformer, TransformRequest, TransformResult } from './TextTransformer';
import { buildAskPrompt, buildEnhancePrompt, TEXT_SYSTEM_PROMPT } from './textPrompts';

export class TextTransformationService implements TextTransformer {
  constructor(private readonly provider: LlmProvider, private readonly model: string) {}

  async transform(request: TransformRequest, signal?: AbortSignal): Promise<TransformResult> {
    if (request.action === 'rawWrite') return { text: request.sourceText.trim() };
    const instruction = this.buildInstruction(request);
    const response = await this.provider.generate({
      model: this.model,
      messages: [
        { role: 'system', content: TEXT_SYSTEM_PROMPT },
        { role: 'user', content: `${instruction}\n\n原始内容：\n${request.sourceText}` },
      ],
      temperature: 0.2,
    }, signal);

    return { text: response.text.trim(), citations: response.citations };
  }

  private buildInstruction(request: TransformRequest): string {
    return request.action === 'enhance' ? buildEnhancePrompt() : buildAskPrompt();
  }
}
