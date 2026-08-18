import './App.css';
import { useState } from 'react';
import { getProviderPreset, PROVIDER_PRESETS } from './infrastructure/providers/providerPresets';
import { loadAsrConfig, loadLlmConfig, loadRawWriteLlmEnabled, saveAsrConfig, saveLlmConfig, saveRawWriteLlmEnabled, type AsrConfig, type LlmConfig } from './infrastructure/config/providerConfig';
import { loadSearchConfig, saveSearchConfig, type SearchConfig } from './infrastructure/config/searchConfig';

export function SettingsPage() {
  const [asrConfig, setAsrConfig] = useState<AsrConfig>(() => loadAsrConfig() ?? {
    providerId: 'qwen3-asr-flash', baseUrl: 'https://{WorkspaceId}.cn-beijing.maas.aliyuncs.com/compatible-mode/v1', model: 'qwen3-asr-flash', apiKey: '', workspaceId: '',
  });
  const [saved, setSaved] = useState(false);
  const [llmConfig, setLlmConfig] = useState<LlmConfig>(() => loadLlmConfig() ?? {
    providerId: 'deepseek', baseUrl: 'https://api.deepseek.com', model: 'deepseek-v4-flash', apiKey: '',
  });
  const [llmSaved, setLlmSaved] = useState(false);
  const [rawWriteLlmEnabled, setRawWriteLlmEnabled] = useState(() => loadRawWriteLlmEnabled());
  const [searchConfig, setSearchConfig] = useState<SearchConfig>(() => loadSearchConfig() ?? {
    providerId: 'zhipu-web-search', endpoint: 'https://open.bigmodel.cn/api/paas/v4/web_search', apiKey: '',
  });
  const [searchSaved, setSearchSaved] = useState(false);
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
    <section className="settings-section"><h2>文本处理模型</h2><p>ASR 转写完成后，使用该模型整理口语、补充标点并保留原意。</p>
      <form onSubmit={(event) => { event.preventDefault(); saveLlmConfig(llmConfig); saveRawWriteLlmEnabled(rawWriteLlmEnabled); setLlmSaved(true); }}>
        <label className="checkbox-row"><input type="checkbox" checked={rawWriteLlmEnabled} onChange={(event) => setRawWriteLlmEnabled(event.target.checked)} /><span>原文原写使用 LLM 整理</span></label>
        <p className="field-hint">关闭时直接写回 ASR 原文；开启后会先去除口头语、补充标点并修正明显语病。</p>
        <label>Provider<select value={llmConfig.providerId} onChange={(event) => { const preset = getProviderPreset(event.target.value); if (preset) setLlmConfig({ ...llmConfig, providerId: preset.id, baseUrl: preset.baseUrl, model: preset.defaultModel }); }}>{PROVIDER_PRESETS.filter((preset) => preset.kind === 'llm').map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}</select></label>
        <label>API 地址<input value={llmConfig.baseUrl} onChange={(event) => setLlmConfig({ ...llmConfig, baseUrl: event.target.value })} /></label>
        <label>模型<input value={llmConfig.model} onChange={(event) => setLlmConfig({ ...llmConfig, model: event.target.value })} /></label>
        <label>API Key<input type="password" value={llmConfig.apiKey} onChange={(event) => setLlmConfig({ ...llmConfig, apiKey: event.target.value })} placeholder="只保存在本机" /></label>
        <button className="save-button" type="submit">{llmSaved ? '已保存' : '保存文本模型配置'}</button>
      </form>
    </section>
    <section className="settings-section"><h2>网页检索</h2><p>使用智谱 Web Search 获取网页结果，再由文本模型整理答案和来源。</p>
      <form onSubmit={(event) => { event.preventDefault(); saveSearchConfig(searchConfig); setSearchSaved(true); }}>
        <label>Provider<input value="智谱 Web Search" readOnly /></label>
        <label>API 地址<input value={searchConfig.endpoint} onChange={(event) => setSearchConfig({ ...searchConfig, endpoint: event.target.value })} /></label>
        <label>API Key<input type="password" value={searchConfig.apiKey} onChange={(event) => setSearchConfig({ ...searchConfig, apiKey: event.target.value })} placeholder="只保存在本机" /></label>
        <button className="save-button" type="submit">{searchSaved ? '已保存' : '保存检索配置'}</button>
      </form>
    </section>
    <section className="settings-section muted"><h2>更多设置</h2><p>快捷键、输出行为、历史记录和文本模型配置将在后续版本加入。</p></section>
  </main>;
}
