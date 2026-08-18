# 变更记录 #019 — 2026-08-18

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, interaction, security | 🟡 中 | 无选区时剪贴板残留内容可能被误判为选区，且选区错误会把会话留在不可再次触发的错误状态 | 使用 Windows 剪贴板序列号确认 Ctrl+C 是否真正改变剪贴板，并允许同类选区错误通过 Ctrl+右 Alt 重试 |

## 涉及文件

- `src/capabilities/input/SelectedTextInputPort.ts` — 增加剪贴板序列号校验
- `src/capabilities/input/SelectedTextInputPort.test.ts` — 覆盖内容变化但序列号未变化的误判场景
- `src/infrastructure/input/TauriSelectedTextInput.ts` — 接入剪贴板序列号命令
- `src-tauri/src/output.rs` — 暴露 Windows `GetClipboardSequenceNumber`
- `src-tauri/src/lib.rs`、`src-tauri/Cargo.toml` — 注册命令并启用 Windows DataExchange 特性
- `src-tauri/src/shortcut.rs` — 忽略 Ctrl+C 模拟产生的注入键盘事件
- `src/application/shortcutAvailability.ts` — 允许选区转写错误后再次触发同一组合键
- `src/App.tsx` — 选区错误状态重试和目标引用清理

## 核心改动

- 无选区时，即使剪贴板文本出现异步残留变化，只要剪贴板序列号未变化，也不会进入 LLM 处理。
- 选中文字后再次按 `Ctrl + 右 Alt` 可以重试，不再因为上一次“未检测到选中文字”而无响应。
- 过滤模拟 Ctrl+C 产生的注入键盘事件，避免破坏 Ctrl 状态追踪。

## 验证

- `cargo test --manifest-path src-tauri/Cargo.toml` — 4 个 Rust 测试通过 ✅
- `npm test -- --run` — 22 个测试文件、67 个测试全部通过 ✅
- `npm run build` — Vite 生产构建通过 ✅
- `cargo check --manifest-path src-tauri/Cargo.toml` — 通过 ✅
- `git diff --check` — 无差异格式错误 ✅
