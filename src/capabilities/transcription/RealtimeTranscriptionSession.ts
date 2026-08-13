export type RealtimeTranscriptionResult = { text: string };

export interface RealtimeTranscriptionTransport {
  start(): Promise<void>;
  pushChunk(chunk: Uint8Array): Promise<void>;
  finish(): Promise<RealtimeTranscriptionResult>;
  cancel(): Promise<void>;
}

export class RealtimeTranscriptionSession {
  private active = false;
  private cancelled = false;

  constructor(private readonly transport: RealtimeTranscriptionTransport) {}

  async start(): Promise<void> {
    if (this.active) return;
    this.cancelled = false;
    await this.transport.start();
    this.active = true;
  }

  async pushChunk(chunk: Uint8Array): Promise<void> {
    if (this.cancelled || !this.active) throw new Error('会话已取消或尚未启动');
    if (chunk.byteLength === 0) return;
    await this.transport.pushChunk(chunk);
  }

  async finish(): Promise<RealtimeTranscriptionResult> {
    if (this.cancelled || !this.active) throw new Error('会话已取消或尚未启动');
    this.active = false;
    const result = await this.transport.finish();
    if (!result.text.trim()) throw new Error('没有识别到有效语音');
    return { text: result.text.trim() };
  }

  async cancel(): Promise<void> {
    if (!this.active && this.cancelled) return;
    this.cancelled = true;
    this.active = false;
    await this.transport.cancel();
  }
}
