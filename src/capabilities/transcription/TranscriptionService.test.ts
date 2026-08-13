import { expect, it, vi } from 'vitest';
import { TranscriptionService } from './TranscriptionService';

it('fails clearly when no transcriber is configured', async () => {
  await expect(new TranscriptionService().transcribe(new Blob(['audio'])))
    .rejects.toThrow('转录服务未配置');
});

it('normalizes a successful transcript', async () => {
  const transcriber = { transcribe: vi.fn().mockResolvedValue({ text: '  你好，世界。  ' }) };
  await expect(new TranscriptionService(transcriber).transcribe(new Blob(['audio'])))
    .resolves.toEqual({ text: '你好，世界。' });
});

it('rejects empty transcripts', async () => {
  const transcriber = { transcribe: vi.fn().mockResolvedValue({ text: '   ' }) };
  await expect(new TranscriptionService(transcriber).transcribe(new Blob(['audio'])))
    .rejects.toThrow('没有识别到有效语音');
});
