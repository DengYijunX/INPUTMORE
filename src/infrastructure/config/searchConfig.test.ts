import { beforeEach, describe, expect, it } from 'vitest';
import { clearSearchConfig, loadSearchConfig, saveSearchConfig } from './searchConfig';

describe('search config', () => {
  beforeEach(() => localStorage.clear());

  it('persists and loads endpoint and API key locally', () => {
    saveSearchConfig({ providerId: 'zhipu-web-search', endpoint: ' https://search.test ', apiKey: 'secret' });

    expect(loadSearchConfig()).toEqual({ providerId: 'zhipu-web-search', endpoint: 'https://search.test', apiKey: 'secret' });
  });

  it('returns undefined for incomplete config and clears saved config', () => {
    saveSearchConfig({ providerId: '', endpoint: 'https://search.test', apiKey: '' });
    expect(loadSearchConfig()).toBeUndefined();
    saveSearchConfig({ providerId: 'zhipu-web-search', endpoint: 'https://search.test', apiKey: 'secret' });
    clearSearchConfig();
    expect(loadSearchConfig()).toBeUndefined();
  });
});
