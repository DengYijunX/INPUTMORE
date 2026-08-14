export type TargetContext = {
  id: string;
};

export type OutputResult =
  | { ok: true; undoId?: string }
  | {
      ok: false;
      code: 'target_unavailable' | 'clipboard_unavailable' | 'paste_failed' | 'cancelled';
      message: string;
    };

export interface TextOutputPort {
  captureTarget(): Promise<TargetContext>;
  insertText(text: string, target: TargetContext): Promise<OutputResult>;
  undoText(target: TargetContext): Promise<OutputResult>;
  copyText(text: string): Promise<void>;
}
