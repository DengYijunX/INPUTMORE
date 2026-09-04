const TRANSLATION_CONFIG_KEY = 'inputmore.translation.config';
const MAX_TRANSLATION_LANGUAGES = 3;

export type TranslationLanguage = {
  code: string;
  label: string;
};

export type TranslationConfig = {
  languages: TranslationLanguage[];
  defaultLanguage: string;
};

export const DEFAULT_TRANSLATION_CONFIG: TranslationConfig = {
  languages: [
    { code: 'en-US', label: '英语（美国）' },
    { code: 'zh-CN', label: '简体中文' },
    { code: 'ja-JP', label: '日本語' },
  ],
  defaultLanguage: 'en-US',
};

export const AVAILABLE_TRANSLATION_LANGUAGES: TranslationLanguage[] = [
  ...DEFAULT_TRANSLATION_CONFIG.languages,
  { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'es-ES', label: 'Español' },
  { code: 'ko-KR', label: '한국어' },
];

export function loadTranslationConfig(): TranslationConfig {
  const raw = localStorage.getItem(TRANSLATION_CONFIG_KEY);
  if (!raw) return cloneConfig(DEFAULT_TRANSLATION_CONFIG);
  try {
    return normalizeConfig(JSON.parse(raw) as Partial<TranslationConfig>);
  } catch {
    return cloneConfig(DEFAULT_TRANSLATION_CONFIG);
  }
}

export function saveTranslationConfig(config: TranslationConfig): void {
  localStorage.setItem(TRANSLATION_CONFIG_KEY, JSON.stringify(normalizeConfig(config)));
}

export function addTranslationLanguage(config: TranslationConfig, language: TranslationLanguage): TranslationConfig {
  const code = language.code.trim();
  const label = language.label.trim();
  if (!code || !label || config.languages.some((item) => item.code === code) || config.languages.length >= MAX_TRANSLATION_LANGUAGES) return config;
  return normalizeConfig({ ...config, languages: [...config.languages, { code, label }] });
}

export function removeTranslationLanguage(config: TranslationConfig, code: string): TranslationConfig {
  if (config.languages.length <= 1) return config;
  return normalizeConfig({ ...config, languages: config.languages.filter((item) => item.code !== code) });
}

export function setDefaultTranslationLanguage(config: TranslationConfig, code: string): TranslationConfig {
  if (!config.languages.some((item) => item.code === code)) return config;
  return { ...config, defaultLanguage: code };
}

function normalizeConfig(value: Partial<TranslationConfig>): TranslationConfig {
  const languages = Array.isArray(value.languages)
    ? value.languages.reduce<TranslationLanguage[]>((result, item) => {
      if (!item || typeof item.code !== 'string' || typeof item.label !== 'string') return result;
      const code = item.code.trim();
      const label = item.label.trim();
      if (code && label && !result.some((existing) => existing.code === code)) result.push({ code, label });
      return result;
    }, []).slice(0, MAX_TRANSLATION_LANGUAGES)
    : [];
  const safeLanguages = languages.length > 0 ? languages : cloneConfig(DEFAULT_TRANSLATION_CONFIG).languages;
  const requestedDefault = typeof value.defaultLanguage === 'string' ? value.defaultLanguage.trim() : '';
  const defaultLanguage = requestedDefault && safeLanguages.some(({ code }) => code === requestedDefault)
    ? requestedDefault
    : safeLanguages[0].code;
  return { languages: safeLanguages, defaultLanguage };
}

function cloneConfig(config: TranslationConfig): TranslationConfig {
  return { languages: config.languages.map((language) => ({ ...language })), defaultLanguage: config.defaultLanguage };
}
