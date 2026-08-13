import { describe, expect, it, vi } from 'vitest';
import { AudioCapture } from './audioCapture';

function createRecorderHarness() {
  const tracks = [{ stop: vi.fn() }];
  const stream = { getTracks: () => tracks } as unknown as MediaStream;
  const recorder = {
    state: 'inactive',
    start: vi.fn(function (this: { state: string }) { this.state = 'recording'; }),
    stop: vi.fn(function (this: { state: string; onstop?: () => void }) {
      this.state = 'inactive';
      this.onstop?.();
    }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    ondataavailable: undefined as ((event: { data: Blob }) => void) | undefined,
    onstop: undefined as (() => void) | undefined,
    onerror: undefined as (() => void) | undefined,
  } as unknown as MediaRecorder;

  return { tracks, stream, recorder };
}

describe('AudioCapture', () => {
  it('starts and stops recording once, releasing microphone tracks', async () => {
    const harness = createRecorderHarness();
    const getUserMedia = vi.fn().mockResolvedValue(harness.stream);
    const createRecorder = vi.fn().mockReturnValue(harness.recorder);
    const capture = new AudioCapture({ getUserMedia, createRecorder });

    await capture.start();
    harness.recorder.ondataavailable?.({ data: new Blob(['audio']) } as BlobEvent);
    const audio = await capture.stop();

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(createRecorder).toHaveBeenCalledWith(harness.stream);
    expect(audio.size).toBeGreaterThan(0);
    expect(harness.tracks[0].stop).toHaveBeenCalledOnce();
  });

  it('maps microphone permission failures to a stable error', async () => {
    const capture = new AudioCapture({
      getUserMedia: vi.fn().mockRejectedValue(new DOMException('denied', 'NotAllowedError')),
      createRecorder: vi.fn(),
    });

    await expect(capture.start()).rejects.toMatchObject({ code: 'microphone_permission_denied' });
  });

  it('emits non-empty audio chunks while recording', async () => {
    const harness = createRecorderHarness();
    const onChunk = vi.fn();
    const capture = new AudioCapture({
      getUserMedia: vi.fn().mockResolvedValue(harness.stream),
      createRecorder: vi.fn().mockReturnValue(harness.recorder),
      onChunk,
    });

    await capture.start();
    const chunk = new Blob(['chunk']);
    harness.recorder.ondataavailable?.({ data: chunk } as BlobEvent);

    expect(onChunk).toHaveBeenCalledWith(chunk);
  });
});
