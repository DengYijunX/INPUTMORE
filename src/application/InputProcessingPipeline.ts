import type { Action } from '../domain/actions';
import type { TextTransformer, TransformResult } from '../capabilities/text/TextTransformer';
import type { Transcriber } from '../capabilities/transcription/Transcriber';

export class InputProcessingPipeline {
  constructor(
    private readonly transcriber: Transcriber,
    private readonly transformer: TextTransformer,
  ) {}

  async run(audio: Blob, action: Action, signal?: AbortSignal): Promise<TransformResult> {
    const transcript = await this.transcriber.transcribe(audio, signal);
    if (!transcript.text.trim()) throw new Error('没有识别到有效语音');
    if (action === 'rawWrite') return { text: transcript.text.trim() };
    return this.transformer.transform({ action, sourceText: transcript.text.trim() }, signal);
  }
}
