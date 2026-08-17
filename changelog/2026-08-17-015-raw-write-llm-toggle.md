# 变更记录 #015 — 2026-08-17

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, config | 🟡 中 | `rawWrite` 只有直接写回一种模式，无法兼容用户对 LLM 整理的偏好 | 增加本地开关，关闭时原文直写，开启时复用现有 LLM 整理流程 |

## 涉及文件

- Modify: `src/infrastructure/config/providerConfig.ts` — 增加 `rawWrite` LLM 开关的读写。
- Modify: `src/infrastructure/config/providerConfig.test.ts` — 增加默认关闭和持久化测试。
- Modify: `src/SettingsPage.tsx` — 增加“原文原写使用 LLM 整理”开关。
- Modify: `src/App.tsx` — 根据开关选择 ASR 原文直写或 LLM 整理后写回。
- Modify: `src/App.css` — 增加设置页开关和说明样式。
- Create: `changelog/2026-08-17-015-raw-write-llm-toggle.md` — 记录本次变更。

## 核心改动

- 默认关闭 LLM，保持原生、低延迟的 `rawWrite` 行为。
- 开启后沿用现有 `enhance` Prompt：去除口头语、补充标点、修正明显语病。
- 开启但未配置 LLM 时，明确提示“已开启 LLM 整理，但尚未配置文本模型”。
- ASR 配置和 LLM 配置仍然独立保存。

## 验证

- `npm test -- --run`：19 个测试文件、61 个测试通过。
- `npm run build`：通过。
- `cargo check --manifest-path src-tauri/Cargo.toml`：通过。
