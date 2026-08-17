# 变更记录 #016 — 2026-08-17

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, output | 🟡 中 | 现有产品只有录音原文原写入口，文本转写无法在不依赖外部输入框焦点的情况下使用 | 增加浮窗文本输入入口，调用已有 LLM 整理能力，在浮窗内预览并手动复制，不自动写回 |

## 涉及文件

- `src/App.tsx` — 增加文本输入、Ctrl/⌘+Enter 提交、取消、LLM 转写和预览复制流程
- `src/App.css` — 增加文本输入面板、提交按钮和结果复制按钮样式
- `src/application/textInput.ts` — 提供文本提交快捷键判断
- `src/application/textInput.test.ts` — 覆盖 Ctrl/⌘+Enter 和普通按键边界
- `src/domain/actions.ts` — 增加 `textInput` 会话状态
- `src/state/sessionMachine.ts` — 支持文本输入状态取消并补齐状态分支
- `src/state/sessionMachine.test.ts` — 覆盖文本输入状态取消
- `src/presentation/StatusView.tsx` — 补充文本输入状态展示

## 核心改动

- 待机浮窗增加“文本”入口，进入独立的文本输入状态。
- 文本输入支持多行编辑，Ctrl+Enter（macOS 为 ⌘+Enter）提交，Escape 或取消按钮退出。
- 文本转写复用现有 `TextTransformationService` 和用户配置的 LLM Provider。
- 结果仅在浮窗内预览并提供“复制文本”，不会自动写回当前应用，也不会改变录音 `rawWrite` 流程。
- 统一复制反馈和取消时的临时状态清理。

## 验证

- `npm run build` — Vite 生产构建通过 ✅
- `npm test -- --run` — 20 个测试文件、62 个测试全部通过 ✅
- `cargo check --manifest-path src-tauri/Cargo.toml` — Rust 检查通过 ✅
- `git diff --check` — 仅有 Git 的换行格式提示，无差异格式错误 ✅
