import { describe, expect, it } from 'vitest';
import type { TextTransformer, TransformRequest } from '../capabilities/text/TextTransformer';
import type { Transcript, Transcriber } from '../capabilities/transcription/Transcriber';
import { InputProcessingPipeline } from './InputProcessingPipeline';

class StubTranscriber implements Transcriber {
  async transcribe(): Promise<Transcript> { return { text: '嗯 我们下周再讨论' }; }
}

class StubTransformer implements TextTransformer {
  request?: TransformRequest;
  async transform(request: TransformRequest): Promise<{ text: string }> { this.request = request; return { text: '我们下周再讨论。' }; }
}

describe('InputProcessingPipeline', () => {
  it('transcribes and enhances once before returning the final text', async () => {
    const transformer = new StubTransformer();
    const pipeline = new InputProcessingPipeline(new StubTranscriber(), transformer);

    const result = await pipeline.run(new Blob(['audio']), 'enhance');

    expect(transformer.request).toMatchObject({ action: 'enhance', sourceText: '嗯 我们下周再讨论' });
    expect(result).toEqual({ text: '我们下周再讨论。' });
  });

  it('returns raw transcription without invoking the transformer for rawWrite', async () => {
    const transformer = new StubTransformer();
    const pipeline = new InputProcessingPipeline(new StubTranscriber(), transformer);

    const result = await pipeline.run(new Blob(['audio']), 'rawWrite');

    expect(transformer.request).toBeUndefined();
    expect(result).toEqual({ text: '嗯 我们下周再讨论' });
  });
});
