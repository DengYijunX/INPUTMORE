import './App.css';
import { useState } from 'react';
import { getProviderPreset, PROVIDER_PRESETS } from './infrastructure/providers/providerPresets';
import { loadAsrConfig, saveAsrConfig, type AsrConfig } from './infrastructure/config/providerConfig';

export function SettingsPage() {
  const [asrConfig, setAsrConfig] = useState<AsrConfig>(() => loadAsrConfig() ?? {
    providerId: 'aliyun-paraformer', baseUrl: 'wss://{WorkspaceId}.cn-beijing.maas.aliyuncs.com/api-ws/v1/inference', model: 'paraformer-realtime-v2', apiKey: '', workspaceId: '',
  });
  const [saved, setSaved] = useState(false);
  const updateProvider = (providerId: string) => {
    const preset = getProviderPreset(providerId);
    if (preset) setAsrConfig((current) => ({ ...current, providerId, baseUrl: preset.baseUrl, model: preset.defaultModel }));
  };
  return <main className="settings-page">
    <header><div><p className="eyebrow">INPUTMORE</p><h1>设置</h1><p className="page-description">配置语音识别、模型与输入行为。</p></div></header>
    <section className="settings-section"><h2>语音识别</h2><p>录音结束后，使用所选 Provider 将语音转换为文本。</p>
      <form onSubmit={(event) => { event.preventDefault(); saveAsrConfig(asrConfig); setSaved(true); }}>
        <label>Provider<select value={asrConfig.providerId} onChange={(event) => updateProvider(event.target.value)}>{PROVIDER_PRESETS.filter((preset) => preset.kind === 'asr').map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}</select></label>
        <label>API 地址<input value={asrConfig.baseUrl} onChange={(event) => setAsrConfig({ ...asrConfig, baseUrl: event.target.value })} /></label>
        {getProviderPreset(asrConfig.providerId)?.requiresWorkspaceId && <label>Workspace ID<input value={asrConfig.workspaceId ?? ''} onChange={(event) => setAsrConfig({ ...asrConfig, workspaceId: event.target.value })} placeholder="北京地域 Workspace ID" /></label>}
        <label>模型<input value={asrConfig.model} onChange={(event) => setAsrConfig({ ...asrConfig, model: event.target.value })} /></label>
        <label>API Key<input type="password" value={asrConfig.apiKey} onChange={(event) => setAsrConfig({ ...asrConfig, apiKey: event.target.value })} placeholder="只保存在本机" /></label>
        <button className="save-button" type="submit">{saved ? '已保存' : '保存配置'}</button>
      </form>
    </section>
    <section className="settings-section muted"><h2>更多设置</h2><p>快捷键、输出行为、历史记录和文本模型配置将在后续版本加入。</p></section>
  </main>;
}
