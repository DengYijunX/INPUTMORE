export type AudioCaptureErrorCode = 'microphone_permission_denied' | 'microphone_unavailable' | 'recording_failed';

export class AudioCaptureError extends Error {
  constructor(public readonly code: AudioCaptureErrorCode, message: string) {
    super(message);
    this.name = 'AudioCaptureError';
  }
}

type RecorderFactory = (stream: MediaStream) => MediaRecorder;

export class AudioCapture {
  private stream?: MediaStream;
  private recorder?: MediaRecorder;
  private chunks: Blob[] = [];
  private stopPromise?: Promise<Blob>;

  constructor(private readonly dependencies: {
    getUserMedia: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
    createRecorder: RecorderFactory;
  }) {}

  async start(): Promise<void> {
    if (this.recorder?.state === 'recording') return;

    try {
      this.stream = await this.dependencies.getUserMedia({ audio: true });
      this.recorder = this.dependencies.createRecorder(this.stream);
    } catch (error) {
      const denied = error instanceof DOMException && error.name === 'NotAllowedError';
      throw new AudioCaptureError(
        denied ? 'microphone_permission_denied' : 'microphone_unavailable',
        denied ? '麦克风权限被拒绝' : '麦克风不可用',
      );
    }

    this.chunks = [];
    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.chunks.push(event.data);
    };
    this.recorder.start();
  }

  stop(): Promise<Blob> {
    if (this.stopPromise) return this.stopPromise;
    if (!this.recorder || !this.stream) return Promise.reject(new AudioCaptureError('recording_failed', '当前没有正在进行的录音'));

    this.stopPromise = new Promise<Blob>((resolve, reject) => {
      const recorder = this.recorder!;
      const stream = this.stream!;
      const cleanup = () => {
        stream.getTracks().forEach((track) => track.stop());
        this.recorder = undefined;
        this.stream = undefined;
        this.stopPromise = undefined;
      };
      recorder.onstop = () => {
        const audio = new Blob(this.chunks, { type: recorder.mimeType || 'audio/webm' });
        cleanup();
        audio.size > 0 ? resolve(audio) : reject(new AudioCaptureError('recording_failed', '没有捕获到音频'));
      };
      recorder.onerror = () => {
        cleanup();
        reject(new AudioCaptureError('recording_failed', '录音失败'));
      };
      if (recorder.state === 'recording') recorder.stop();
      else cleanup();
    });

    return this.stopPromise;
  }

  cancel(): void {
    this.recorder?.stop();
    this.stream?.getTracks().forEach((track) => track.stop());
    this.recorder = undefined;
    this.stream = undefined;
    this.chunks = [];
    this.stopPromise = undefined;
  }
}
