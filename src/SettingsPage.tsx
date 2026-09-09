import './App.css';
import { useRef, useState } from 'react';
import { getProviderPreset, PROVIDER_PRESETS } from './infrastructure/providers/providerPresets';
import { loadAsrConfig, loadLlmConfig, loadRawWriteLlmEnabled, saveAsrConfig, saveLlmConfig, saveRawWriteLlmEnabled, type AsrConfig, type LlmConfig } from './infrastructure/config/providerConfig';
import { loadSearchConfig, saveSearchConfig, type SearchConfig } from './infrastructure/config/searchConfig';
import { addTranslationLanguage, AVAILABLE_TRANSLATION_LANGUAGES, loadTranslationConfig, removeTranslationLanguage, saveTranslationConfig, setDefaultTranslationLanguage, type TranslationConfig } from './infrastructure/config/translationConfig';

export function SettingsPage() {
  const storedAsrConfig = loadAsrConfig();
  const [asrConfig, setAsrConfig] = useState<AsrConfig>(() => storedAsrConfig ? { ...storedAsrConfig, apiKey: '' } : {
    providerId: 'qwen3-asr-flash', baseUrl: 'https://{WorkspaceId}.cn-beijing.maas.aliyuncs.com/compatible-mode/v1', model: 'qwen3-asr-flash', apiKey: '', workspaceId: '',
  });
  const asrApiKeyRef = useRef(storedAsrConfig?.apiKey ?? '');
  const [saved, setSaved] = useState(false);
  const storedLlmConfig = loadLlmConfig();
  const [llmConfig, setLlmConfig] = useState<LlmConfig>(() => storedLlmConfig ? { ...storedLlmConfig, apiKey: '' } : {
    providerId: 'deepseek', baseUrl: 'https://api.deepseek.com', model: 'deepseek-v4-flash', apiKey: '',
  });
  const llmApiKeyRef = useRef(storedLlmConfig?.apiKey ?? '');
  const [llmSaved, setLlmSaved] = useState(false);
  const [rawWriteLlmEnabled, setRawWriteLlmEnabled] = useState(() => loadRawWriteLlmEnabled());
  const storedSearchConfig = loadSearchConfig();
  const [searchConfig, setSearchConfig] = useState<SearchConfig>(() => storedSearchConfig ? { ...storedSearchConfig, apiKey: '' } : {
    providerId: 'zhipu-web-search', endpoint: 'https://open.bigmodel.cn/api/paas/v4/web_search', apiKey: '',
  });
  const searchApiKeyRef = useRef(storedSearchConfig?.apiKey ?? '');
  const [searchSaved, setSearchSaved] = useState(false);
  const [translationConfig, setTranslationConfig] = useState<TranslationConfig>(() => loadTranslationConfig());
  const [translationLanguageToAdd, setTranslationLanguageToAdd] = useState('');
  const [translationSaved, setTranslationSaved] = useState(false);
  const updateProvider = (providerId: string) => {
    const preset = getProviderPreset(providerId);
    if (preset) {
      setAsrConfig((current) => ({ ...current, providerId, baseUrl: preset.baseUrl, model: preset.defaultModel }));
      setSaved(false);
    }
  };
  const addLanguage = () => {
    const language = AVAILABLE_TRANSLATION_LANGUAGES.find(({ code }) => code === translationLanguageToAdd);
    if (!language) return;
    setTranslationConfig((current) => addTranslationLanguage(current, language));
    setTranslationLanguageToAdd('');
    setTranslationSaved(false);
  };
  return <main className="settings-page">
    <header><div><p className="eyebrow">INPUTMORE</p><h1>设置</h1><p className="page-description">配置语音识别、模型与输入行为。</p></div></header>
    <section className="settings-section"><h2>语音识别</h2><p>录音结束后，使用所选 Provider 将语音转换为文本。</p>
      <form onSubmit={(event) => { event.preventDefault(); const apiKey = asrConfig.apiKey.trim() ? asrConfig.apiKey : asrApiKeyRef.current; saveAsrConfig({ ...asrConfig, apiKey }); asrApiKeyRef.current = apiKey; setAsrConfig({ ...asrConfig, apiKey: '' }); setSaved(true); }}>
        <label>Provider<select value={asrConfig.providerId} onChange={(event) => updateProvider(event.target.value)}>{PROVIDER_PRESETS.filter((preset) => preset.kind === 'asr').map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}</select></label>
        <label>API 地址<input value={asrConfig.baseUrl} onChange={(event) => { setAsrConfig({ ...asrConfig, baseUrl: event.target.value }); setSaved(false); }} /></label>
        {getProviderPreset(asrConfig.providerId)?.requiresWorkspaceId && <label>Workspace ID<input value={asrConfig.workspaceId ?? ''} onChange={(event) => { setAsrConfig({ ...asrConfig, workspaceId: event.target.value }); setSaved(false); }} placeholder="北京地域 Workspace ID" /></label>}
        <label>模型<input value={asrConfig.model} onChange={(event) => { setAsrConfig({ ...asrConfig, model: event.target.value }); setSaved(false); }} /></label>
        <label>API Key<input type="password" value={asrConfig.apiKey} onChange={(event) => { setAsrConfig({ ...asrConfig, apiKey: event.target.value }); setSaved(false); }} placeholder={asrApiKeyRef.current ? '已配置，输入新密钥替换' : '只保存在本机'} /></label>
        <button className="save-button" type="submit">{saved ? '已保存' : '保存配置'}</button>
      </form>
    </section>
    <section className="settings-section"><h2>文本处理模型</h2><p>ASR 转写完成后，使用该模型整理口语、补充标点并保留原意。</p>
      <form onSubmit={(event) => { event.preventDefault(); const apiKey = llmConfig.apiKey.trim() ? llmConfig.apiKey : llmApiKeyRef.current; saveLlmConfig({ ...llmConfig, apiKey }); saveRawWriteLlmEnabled(rawWriteLlmEnabled); llmApiKeyRef.current = apiKey; setLlmConfig({ ...llmConfig, apiKey: '' }); setLlmSaved(true); }}>
        <label className="checkbox-row"><input type="checkbox" checked={rawWriteLlmEnabled} onChange={(event) => { setRawWriteLlmEnabled(event.target.checked); setLlmSaved(false); }} /><span>原文原写使用 LLM 整理</span></label>
        <p className="field-hint">关闭时直接写回 ASR 原文；开启后会先去除口头语、补充标点并修正明显语病。</p>
        <label>Provider<select value={llmConfig.providerId} onChange={(event) => { const preset = getProviderPreset(event.target.value); if (preset) { setLlmConfig({ ...llmConfig, providerId: preset.id, baseUrl: preset.baseUrl, model: preset.defaultModel }); setLlmSaved(false); } }}>{PROVIDER_PRESETS.filter((preset) => preset.kind === 'llm').map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}</select></label>
        <label>API 地址<input value={llmConfig.baseUrl} onChange={(event) => { setLlmConfig({ ...llmConfig, baseUrl: event.target.value }); setLlmSaved(false); }} /></label>
        <label>模型<input value={llmConfig.model} onChange={(event) => { setLlmConfig({ ...llmConfig, model: event.target.value }); setLlmSaved(false); }} /></label>
        <label>API Key<input type="password" value={llmConfig.apiKey} onChange={(event) => { setLlmConfig({ ...llmConfig, apiKey: event.target.value }); setLlmSaved(false); }} placeholder={llmApiKeyRef.current ? '已配置，输入新密钥替换' : '只保存在本机'} /></label>
        <button className="save-button" type="submit">{llmSaved ? '已保存' : '保存文本模型配置'}</button>
      </form>
    </section>
    <section className="settings-section"><h2>网页检索</h2><p>使用智谱 Web Search 获取网页结果，再由文本模型整理答案和来源。</p>
      <form onSubmit={(event) => { event.preventDefault(); const apiKey = searchConfig.apiKey.trim() ? searchConfig.apiKey : searchApiKeyRef.current; saveSearchConfig({ ...searchConfig, apiKey }); searchApiKeyRef.current = apiKey; setSearchConfig({ ...searchConfig, apiKey: '' }); setSearchSaved(true); }}>
        <label>Provider<input value="智谱 Web Search" readOnly /></label>
        <label>API 地址<input value={searchConfig.endpoint} onChange={(event) => { setSearchConfig({ ...searchConfig, endpoint: event.target.value }); setSearchSaved(false); }} /></label>
        <label>API Key<input type="password" value={searchConfig.apiKey} onChange={(event) => { setSearchConfig({ ...searchConfig, apiKey: event.target.value }); setSearchSaved(false); }} placeholder={searchApiKeyRef.current ? '已配置，输入新密钥替换' : '只保存在本机'} /></label>
        <button className="save-button" type="submit">{searchSaved ? '已保存' : '保存检索配置'}</button>
      </form>
    </section>
    <section className="settings-section"><h2>翻译目标语言</h2><p>管理翻译时快速选择的常用目标语言，最多保存 3 个。</p>
      <form onSubmit={(event) => { event.preventDefault(); saveTranslationConfig(translationConfig); setTranslationSaved(true); }}>
        <div className="translation-language-list">
          {translationConfig.languages.map((language) => <div className="translation-language-row" key={language.code}>
            <label className="translation-default-choice"><input type="radio" name="translation-default" aria-label={`设为默认 ${language.label}`} checked={translationConfig.defaultLanguage === language.code} onChange={() => { setTranslationConfig((current) => setDefaultTranslationLanguage(current, language.code)); setTranslationSaved(false); }} /><span>{language.label}</span>{translationConfig.defaultLanguage === language.code && <small>默认</small>}</label>
            <button type="button" className="remove-language-button" aria-label={`删除 ${language.label}`} disabled={translationConfig.languages.length <= 1} onClick={() => { setTranslationConfig((current) => removeTranslationLanguage(current, language.code)); setTranslationSaved(false); }}>删除</button>
          </div>)}
        </div>
        <div className="translation-add-row">
          <select aria-label="添加目标语言" value={translationLanguageToAdd} onChange={(event) => setTranslationLanguageToAdd(event.target.value)}>
            <option value="">选择语言</option>
            {AVAILABLE_TRANSLATION_LANGUAGES.filter(({ code }) => !translationConfig.languages.some((language) => language.code === code)).map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}
          </select>
          <button type="button" className="secondary-button" disabled={!translationLanguageToAdd || translationConfig.languages.length >= 3} onClick={addLanguage}>添加语言</button>
        </div>
        <button className="save-button" type="submit">{translationSaved ? '已保存' : '保存翻译配置'}</button>
      </form>
    </section>
    <section className="settings-section muted"><h2>更多设置</h2><p>快捷键、输出行为、历史记录和文本模型配置将在后续版本加入。</p></section>
  </main>;
}
