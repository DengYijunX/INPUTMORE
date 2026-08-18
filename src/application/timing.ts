export type TimingFlow = 'selected-text' | 'manual-text';

export type TimingRecord = {
  flow: TimingFlow;
  totalMs: number;
  captureMs?: number;
  modelMs: number;
};

export function createTimingRecord(input: TimingRecord): TimingRecord {
  return {
    flow: input.flow,
    totalMs: Math.round(input.totalMs),
    ...(typeof input.captureMs === 'number' ? { captureMs: Math.round(input.captureMs) } : {}),
    modelMs: Math.round(input.modelMs),
  };
}
