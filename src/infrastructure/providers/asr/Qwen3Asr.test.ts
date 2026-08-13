import { describe, expect, it, vi } from 'vitest';
import { Qwen3Asr } from './Qwen3Asr';

describe('Qwen3Asr', () => {
  it('sends base64 audio through the Qwen OpenAI-compatible chat endpoint', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: '识别结果' } }],
    }), { status: 200 }));
    const provider = new Qwen3Asr({
      baseUrl: 'https://workspace.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
      apiKey: 'secret',
      model: 'qwen3-asr-flash',
      fetcher,
    });

    const result = await provider.transcribe(new Blob(['audio'], { type: 'audio/webm' }));

    expect(result).toEqual({ text: '识别结果' });
    const request = JSON.parse(fetcher.mock.calls[0][1].body as string);
    expect(fetcher.mock.calls[0][0]).toContain('/chat/completions');
    expect(request.model).toBe('qwen3-asr-flash');
    expect(request.messages[0].content[0].type).toBe('input_audio');
    expect(request.messages[0].content[0].input_audio.data).toMatch(/^data:audio\/webm;base64,/);
  });

  it('requires a Workspace ID when the URL still contains the placeholder', async () => {
    const provider = new Qwen3Asr({
      baseUrl: 'https://{WorkspaceId}.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
      apiKey: 'secret', model: 'qwen3-asr-flash', fetcher: vi.fn(),
    });

    await expect(provider.transcribe(new Blob(['audio']))).rejects.toThrow('Workspace ID');
  });

  it('replaces the Workspace ID placeholder before sending the request', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: '结果' } }],
    }), { status: 200 }));
    const provider = new Qwen3Asr({
      baseUrl: 'https://{WorkspaceId}.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
      workspaceId: 'llm-demo123', apiKey: 'secret', model: 'qwen3-asr-flash', fetcher,
    });

    await provider.transcribe(new Blob(['audio'], { type: 'audio/webm' }));

    expect(fetcher.mock.calls[0][0]).toBe('https://llm-demo123.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/chat/completions');
  });

  it('binds the browser fetch context when no custom fetcher is provided', async () => {
    const originalFetch = globalThis.fetch;
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: '结果' } }],
    }), { status: 200 }));
    globalThis.fetch = fetchMock as typeof fetch;
    try {
      const provider = new Qwen3Asr({
        baseUrl: 'https://workspace.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
        apiKey: 'secret', model: 'qwen3-asr-flash',
      });
      await expect(provider.transcribe(new Blob(['audio']))).resolves.toEqual({ text: '结果' });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
