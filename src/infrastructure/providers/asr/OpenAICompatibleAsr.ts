import type { Transcriber, Transcript } from '../../../capabilities/transcription/Transcriber';

type Fetcher = typeof fetch;

export class OpenAICompatibleAsr implements Transcriber {
  constructor(private readonly config: {
    baseUrl: string;
    apiKey: string;
    model: string;
    fetcher?: Fetcher;
  }) {}

  async transcribe(audio: Blob, signal?: AbortSignal): Promise<Transcript> {
    if (!this.config.baseUrl.trim() || !this.config.apiKey.trim() || !this.config.model.trim()) {
      throw new Error('ASR Provider 配置不完整');
    }

    const form = new FormData();
    form.append('file', audio, 'inputmore-audio.webm');
    form.append('model', this.config.model);

    const response = await (this.config.fetcher ?? fetch)(
      `${this.config.baseUrl.replace(/\/$/, '')}/audio/transcriptions`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
        body: form,
        signal,
      },
    );

    if (response.status === 401 || response.status === 403) throw new Error('ASR API Key 无效');
    if (!response.ok) throw new Error(`ASR Provider 请求失败（HTTP ${response.status}）`);

    const payload = await response.json() as { text?: string };
    if (typeof payload.text !== 'string') throw new Error('ASR 返回结果格式无效');
    return { text: payload.text };
  }
}
