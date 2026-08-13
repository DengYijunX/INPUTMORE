import { expect, it, vi } from 'vitest';
import { OpenAICompatibleAsr } from './OpenAICompatibleAsr';

it('uploads audio to the OpenAI-compatible transcription endpoint', async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ text: '转录结果' }), { status: 200 }));
  const asr = new OpenAICompatibleAsr({ baseUrl: 'https://example.test/v1/', apiKey: 'secret', model: 'whisper-1', fetcher });

  await expect(asr.transcribe(new Blob(['audio']))).resolves.toEqual({ text: '转录结果' });
  expect(fetcher).toHaveBeenCalledWith('https://example.test/v1/audio/transcriptions', expect.objectContaining({ method: 'POST' }));
});
