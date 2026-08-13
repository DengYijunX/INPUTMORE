export type ProviderPreset = {
  id: string;
  name: string;
  kind: 'llm' | 'asr';
  baseUrl: string;
  defaultModel: string;
  notes: string;
  requiresWorkspaceId?: boolean;
};

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: 'aliyun-paraformer',
    name: '阿里云 Paraformer',
    kind: 'asr',
    baseUrl: 'wss://{WorkspaceId}.cn-beijing.maas.aliyuncs.com/api-ws/v1/inference',
    defaultModel: 'paraformer-realtime-v2',
    notes: '国内中文实时语音识别，需要北京地域 Workspace ID',
    requiresWorkspaceId: true,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    kind: 'llm',
    baseUrl: 'https://api.deepseek.com',
    defaultModel: 'deepseek-v4-flash',
    notes: '适合低成本文本整理与表达优化',
  },
  {
    id: 'openai-compatible',
    name: 'OpenAI-compatible',
    kind: 'llm',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    notes: '可配置 OpenAI、Qwen、SiliconFlow 等兼容接口',
  },
  {
    id: 'groq-whisper',
    name: 'Groq Whisper',
    kind: 'asr',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'whisper-large-v3-turbo',
    notes: '适合快速验证多语种语音转写',
  },
  {
    id: 'openai-transcribe',
    name: 'OpenAI Transcribe',
    kind: 'asr',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini-transcribe',
    notes: 'OpenAI 官方语音转写接口',
  },
];

export function getProviderPreset(id: string): ProviderPreset | undefined {
  return PROVIDER_PRESETS.find((preset) => preset.id === id);
}
