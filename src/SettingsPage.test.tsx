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
});
