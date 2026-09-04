import { describe, expect, it } from 'vitest';
import {
  addTranslationLanguage,
  DEFAULT_TRANSLATION_CONFIG,
  loadTranslationConfig,
  removeTranslationLanguage,
  saveTranslationConfig,
  setDefaultTranslationLanguage,
  type TranslationConfig,
} from './translationConfig';

describe('translation config', () => {
  it('provides three common languages and a valid default', () => {
    expect(DEFAULT_TRANSLATION_CONFIG.languages).toHaveLength(3);
    expect(DEFAULT_TRANSLATION_CONFIG.languages.some(({ code }) => code === DEFAULT_TRANSLATION_CONFIG.defaultLanguage)).toBe(true);
  });

  it('round-trips a normalized configuration', () => {
    const config: TranslationConfig = {
      languages: [{ code: 'en-US', label: '英语（美国）' }, { code: 'ja-JP', label: '日本語' }],
      defaultLanguage: 'ja-JP',
    };

    saveTranslationConfig(config);

    expect(loadTranslationConfig()).toEqual(config);
  });

  it('limits additions to three unique languages', () => {
    const config = { ...DEFAULT_TRANSLATION_CONFIG, languages: DEFAULT_TRANSLATION_CONFIG.languages.slice(0, 2) };

    const added = addTranslationLanguage(config, { code: 'fr-FR', label: 'Français' });
    expect(added.languages).toHaveLength(3);
    expect(addTranslationLanguage(added, { code: 'fr-FR', label: 'Français' })).toEqual(added);
    expect(addTranslationLanguage(added, { code: 'de-DE', label: 'Deutsch' })).toEqual(added);
  });

  it('does not remove the last language and repairs the default', () => {
    const single: TranslationConfig = { languages: [{ code: 'en-US', label: '英语（美国）' }], defaultLanguage: 'en-US' };
    expect(removeTranslationLanguage(single, 'en-US')).toEqual(single);

    const removed = removeTranslationLanguage(DEFAULT_TRANSLATION_CONFIG, DEFAULT_TRANSLATION_CONFIG.defaultLanguage);
    expect(removed.languages).toHaveLength(2);
    expect(removed.languages.some(({ code }) => code === removed.defaultLanguage)).toBe(true);
  });

  it('only selects an existing language as default and ignores corrupt storage', () => {
    expect(setDefaultTranslationLanguage(DEFAULT_TRANSLATION_CONFIG, 'not-found')).toEqual(DEFAULT_TRANSLATION_CONFIG);
    localStorage.setItem('inputmore.translation.config', '{broken');
    expect(loadTranslationConfig()).toEqual(DEFAULT_TRANSLATION_CONFIG);
  });
});
