import type { LlmProvider } from '../../infrastructure/providers/llm/LlmProvider';
import type { TextTransformer, TransformRequest, TransformResult } from './TextTransformer';

export class TextTransformationService implements TextTransformer {
  constructor(private readonly provider: LlmProvider, private readonly model: string) {}

  async transform(request: TransformRequest, signal?: AbortSignal): Promise<TransformResult> {
    if (request.action === 'rawWrite') return { text: request.sourceText.trim() };
    if (request.action === 'translate' && !request.targetLanguage?.trim()) {
      throw new Error('翻译任务需要目标语言');
    }

    const instruction = this.buildInstruction(request);
    const response = await this.provider.generate({
      model: this.model,
      messages: [
        { role: 'system', content: '你是一个谨慎的桌面输入增强助手。' },
        { role: 'user', content: `${instruction}\n\n原始内容：\n${request.sourceText}` },
      ],
      temperature: 0.2,
    }, signal);

    return { text: response.text.trim(), citations: response.citations };
  }

  private buildInstruction(request: TransformRequest): string {
    if (request.action === 'enhance') {
      return '优化这段语音转写：去除口头禅和明显重复，补充标点并修正明显语病。保留原意、事实和语气，不总结、不扩写、不回答问题，只返回处理后的文本。';
    }
    if (request.action === 'translate') {
      return `将内容翻译成${request.targetLanguage}。保持原意和语气，只返回翻译结果。`;
    }
    return '直接回答用户的问题。基于提供的内容作答，不要把问题改写成 Prompt。';
  }
}
