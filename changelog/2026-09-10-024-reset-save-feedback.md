# 变更记录 #024 — 2026-09-10

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, test, accessibility | 🟢 低 | 设置页配置区的保存成功状态只在提交时更新，没有在用户再次编辑时清除 | 为各配置区字段变更统一重置对应的保存反馈状态 |

## 涉及文件

- Modify: `src/SettingsPage.tsx` — 在 ASR、文本模型、检索和翻译配置编辑时清除已保存状态
- Modify: `src/SettingsPage.test.tsx` — 覆盖保存后再次编辑的按钮文案和 API Key 替换回归

## 核心改动

- 保存成功后，用户再次修改配置字段，按钮立即恢复为对应的“保存…”文案。
- 覆盖 Provider、API 地址、模型、API Key、Workspace ID、LLM 开关和翻译配置变更。
- 不改变配置存储格式和实际保存逻辑。

## 验证

- 命令: `npx vitest --run src/SettingsPage.test.tsx --reporter=dot`
- 结果: 1 个测试文件、4 个测试全部通过 ✅
- 命令: `npx vitest --run --reporter=dot`
- 结果: 40 个测试文件、125 个测试全部通过 ✅
- 命令: `npm run build`
- 结果: TypeScript 检查和 Vite 构建通过 ✅
- 命令: `cargo check --manifest-path src-tauri/Cargo.toml`
- 结果: Rust 检查通过 ✅

