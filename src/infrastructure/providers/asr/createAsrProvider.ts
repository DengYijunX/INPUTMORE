import type { Transcriber } from '../../../capabilities/transcription/Transcriber';
import type { AsrConfig } from '../../config/providerConfig';
import { OpenAICompatibleAsr } from './OpenAICompatibleAsr';
import { Qwen3Asr } from './Qwen3Asr';

export function createAsrProvider(config: AsrConfig): Transcriber {
  if (config.providerId === 'qwen3-asr-flash') return new Qwen3Asr(config);
  return new OpenAICompatibleAsr(config);
}
