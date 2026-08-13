import type { Transcriber, Transcript } from './Transcriber';

export class TranscriptionService {
  constructor(private readonly transcriber?: Transcriber) {}

  async transcribe(audio: Blob, signal?: AbortSignal): Promise<Transcript> {
    if (!this.transcriber) {
      throw new Error('转录服务未配置，请先在设置中配置 ASR Provider');
    }
    const result = await this.transcriber.transcribe(audio, signal);
    if (!result.text.trim()) throw new Error('没有识别到有效语音');
    return { text: result.text.trim() };
  }
}
