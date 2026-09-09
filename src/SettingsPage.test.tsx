import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { SettingsPage } from './SettingsPage';

describe('translation settings', () => {
  beforeEach(() => localStorage.clear());

  it('shows the default target languages and disables adding at the limit', () => {
    render(<SettingsPage />);

    expect(screen.getByRole('heading', { name: '翻译目标语言' })).toBeInTheDocument();
    expect(screen.getByText('英语（美国）')).toBeInTheDocument();
    expect(screen.getByText('简体中文')).toBeInTheDocument();
    expect(screen.getByText('日本語')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '添加语言' })).toBeDisabled();
  });

  it('allows removing, adding, selecting a default, and saving a language configuration', () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole('button', { name: '删除 日本語' }));
    fireEvent.change(screen.getByRole('combobox', { name: '添加目标语言' }), { target: { value: 'fr-FR' } });
    fireEvent.click(screen.getByRole('button', { name: '添加语言' }));
    fireEvent.click(screen.getByRole('radio', { name: '设为默认 Français' }));
    fireEvent.click(screen.getByRole('button', { name: '保存翻译配置' }));

    expect(screen.getByText('已保存')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('inputmore.translation.config') ?? '{}')).toMatchObject({ defaultLanguage: 'fr-FR' });
  });

  it('restores the save label when editing a provider after saving', () => {
    render(<SettingsPage />);

    const saveButton = screen.getByRole('button', { name: '保存文本模型配置' });
    fireEvent.click(saveButton);
    expect(screen.getByRole('button', { name: '已保存' })).toBeInTheDocument();

    fireEvent.change(screen.getAllByLabelText('模型')[1], { target: { value: 'new-model' } });

    expect(screen.getByRole('button', { name: '保存文本模型配置' })).toBeInTheDocument();
  });

  it('does not render existing provider API keys and preserves them when unchanged', () => {
    localStorage.setItem('inputmore.asr.config', JSON.stringify({ providerId: 'qwen3-asr-flash', baseUrl: 'https://asr.example', model: 'asr', apiKey: 'asr-secret' }));
    localStorage.setItem('inputmore.llm.config', JSON.stringify({ providerId: 'deepseek', baseUrl: 'https://llm.example', model: 'llm', apiKey: 'llm-secret' }));
    localStorage.setItem('inputmore.search.config', JSON.stringify({ providerId: 'zhipu-web-search', endpoint: 'https://search.example', apiKey: 'search-secret' }));

    render(<SettingsPage />);

    const apiKeyInputs = document.querySelectorAll<HTMLInputElement>('input[type="password"]');
    expect([...apiKeyInputs].map((input) => input.value)).toEqual(['', '', '']);
    expect([...apiKeyInputs].map((input) => input.placeholder)).toEqual([
      '已配置，输入新密钥替换',
      '已配置，输入新密钥替换',
      '已配置，输入新密钥替换',
    ]);

    fireEvent.click(screen.getByRole('button', { name: '保存配置' }));
    fireEvent.click(screen.getByRole('button', { name: '保存文本模型配置' }));
    fireEvent.click(screen.getByRole('button', { name: '保存检索配置' }));

    expect(JSON.parse(localStorage.getItem('inputmore.asr.config') ?? '{}').apiKey).toBe('asr-secret');
    expect(JSON.parse(localStorage.getItem('inputmore.llm.config') ?? '{}').apiKey).toBe('llm-secret');
    expect(JSON.parse(localStorage.getItem('inputmore.search.config') ?? '{}').apiKey).toBe('search-secret');

    fireEvent.change(apiKeyInputs[0], { target: { value: 'new-asr-secret' } });
    fireEvent.click(screen.getByRole('button', { name: '保存配置' }));
    expect(JSON.parse(localStorage.getItem('inputmore.asr.config') ?? '{}').apiKey).toBe('new-asr-secret');
  });
});
