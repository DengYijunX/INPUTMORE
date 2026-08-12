import { describe, expect, it, vi } from 'vitest';
import { OpenAICompatibleLlm } from './OpenAICompatibleLlm';

describe('OpenAICompatibleLlm', () => {
  it('posts the configured model and returns the first choice', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: '结果' } }],
    }), { status: 200 }));
    const provider = new OpenAICompatibleLlm({
      baseUrl: 'https://example.test/v1/',
      apiKey: 'secret',
      fetcher,
    });

    const result = await provider.generate({
      model: 'model-a',
      messages: [{ role: 'user', content: '你好' }],
    });

    expect(result).toEqual({ text: '结果' });
    expect(fetcher).toHaveBeenCalledWith('https://example.test/v1/chat/completions', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer secret' }),
    }));
  });

  it('normalizes unauthorized responses', async () => {
    const provider = new OpenAICompatibleLlm({
      baseUrl: 'https://example.test/v1',
      apiKey: 'bad-key',
      fetcher: vi.fn().mockResolvedValue(new Response('unauthorized', { status: 401 })),
    });

    await expect(provider.generate({ model: 'model-a', messages: [] }))
      .rejects.toMatchObject({ code: 'provider_unauthorized' });
  });
});
