export type Transcript = {
  text: string;
};

export interface Transcriber {
  transcribe(audio: Blob, signal?: AbortSignal): Promise<Transcript>;
}
