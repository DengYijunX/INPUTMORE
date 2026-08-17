# 变更记录 #014 — 2026-08-17

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| refactor, feature | 🔴 高 | 默认录音链路使用 `enhance` 动作并强制调用 LLM，无法表达“原文原写”与“转写”的功能边界 | 增加 `rawWrite` 动作，默认录音只转录并直接写回；保留 `enhance` 作为后续转写入口 |

## 涉及文件

- Modify: `src/domain/actions.ts` — 增加 `rawWrite` 动作并扩展写回状态类型。
- Modify: `src/application/shortcutEvents.ts` — 右 Alt 事件使用 `rawWrite`。
- Modify: `src/application/InputProcessingPipeline.ts` — `rawWrite` 跳过文本模型处理。
- Modify: `src/application/InputProcessingPipeline.test.ts` — 增加原文直写测试。
- Modify: `src/capabilities/text/TextTransformationService.ts` — `rawWrite` 直接返回原文。
- Modify: `src/capabilities/text/TextTransformationService.test.ts` — 验证原文动作不调用模型。
- Modify: `src/application/shortcutEvents.test.ts` — 对齐右 Alt 动作名。
- Modify: `src/App.tsx` — 默认录音链路直接写回转录文本，不再要求 LLM 配置。
- Modify: `src-tauri/src/shortcut.rs` — 原生快捷键事件发送 `rawWrite`。

## 核心改动

- 右 Alt 默认流程：录音 → ASR → 原文直写。
- 没有 LLM 配置时，原文直写仍可工作。
- `enhance` 保留为后续“转写”功能的模型动作。
- 输入方式与功能动作开始分离，为文本转写和检索预留扩展边界。

## 验证

- `npm test -- --run`：19 个测试文件、60 个测试通过。
- `npm run build`：通过。
- `cargo check --manifest-path src-tauri/Cargo.toml`：通过。
