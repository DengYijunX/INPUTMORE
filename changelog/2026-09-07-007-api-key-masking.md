# 变更记录 #007 — 2026-09-07

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, security, config, test | 🔴 高 | Provider 密钥配置被直接作为受控输入值渲染到设置页 DOM，调试工具或页面脚本可以读取完整密钥。 | 使用“空值编辑 + 配置内存引用”的方式展示密钥状态；未输入新密钥时保留原值，输入新密钥时才替换。 |

## 涉及文件

- Modify: `src/SettingsPage.tsx` — 三类 Provider 的 API Key 不再回显，保存时保留未修改的旧密钥。
- Modify: `src/SettingsPage.test.tsx` — 覆盖密钥不回显、未修改保留和输入新密钥替换。

## 核心改动

- ASR、文本处理模型和网页检索的已保存 API Key 从编辑状态中移除，输入框只保留空值。
- 已配置密钥显示为“已配置，输入新密钥替换”，未配置密钥显示普通本地保存提示。
- 保存时空输入代表“不修改”，不会覆盖已保存密钥。
- 用户输入新密钥后才会更新对应 Provider 配置。
- 未修改 Provider 接口、翻译流程、检索流程和实际请求格式。

## 验证

- 命令: `npx vitest --run src/SettingsPage.test.tsx --reporter=verbose`
- 结果: 3 个设置页测试通过；新增测试先按预期失败，修复后通过 ✅
- 命令: `npx vitest --run --reporter=dot`
- 结果: 39 个测试文件、114 个测试通过 ✅
- 命令: `npm run build`
- 结果: TypeScript 检查和 Vite 生产构建通过，74 个模块转换完成 ✅
- 命令: `cargo check --manifest-path src-tauri/Cargo.toml`
- 结果: Rust `dev` profile 检查通过 ✅
- 桌面端 CDP: 3 个 API Key 输入框均为空，仅显示配置状态占位符 ✅
