import type { Transcriber, Transcript } from '../../../capabilities/transcription/Transcriber';

type Fetcher = typeof fetch;

export class Qwen3Asr implements Transcriber {
  constructor(private readonly config: {
    baseUrl: string;
    workspaceId?: string;
    apiKey: string;
    model: string;
    fetcher?: Fetcher;
  }) {}

  async transcribe(audio: Blob, signal?: AbortSignal): Promise<Transcript> {
    if (!this.config.baseUrl.trim() || !this.config.apiKey.trim() || !this.config.model.trim()) {
      throw new Error('Qwen3-ASR Provider 配置不完整');
    }
    const baseUrl = this.config.baseUrl.replace('{WorkspaceId}', this.config.workspaceId?.trim() ?? '');
    if (baseUrl.includes('{WorkspaceId}') || !baseUrl.startsWith('https://') || baseUrl.includes('https://.')) {
      throw new Error('Qwen3-ASR 需要填写 Workspace ID');
    }

    const data = await blobToDataUri(audio);
    const response = await (this.config.fetcher ?? fetch)(
      `${baseUrl.replace(/\/$/, '')}/chat/completions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: [{ type: 'input_audio', input_audio: { data } }] }],
          stream: false,
        }),
        signal,
      },
    );

    if (response.status === 401 || response.status === 403) throw new Error('Qwen3-ASR API Key 无效');
    if (!response.ok) throw new Error(`Qwen3-ASR Provider 请求失败（HTTP ${response.status}）`);

    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const text = payload.choices?.[0]?.message?.content;
    if (typeof text !== 'string') throw new Error('Qwen3-ASR 返回结果格式无效');
    return { text };
  }
}

async function blobToDataUri(audio: Blob): Promise<string> {
  const bytes = new Uint8Array(await new Response(audio).arrayBuffer());
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return `data:${audio.type || 'application/octet-stream'};base64,${btoa(binary)}`;
}
