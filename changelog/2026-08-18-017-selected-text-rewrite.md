# 变更记录 #017 — 2026-08-18

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, output | 🟡 中 | 快捷键只能启动录音，无法直接处理用户在其他窗口中已经选中的文本 | 首次按下右 Alt 时先读取当前选区；有选区则走 LLM 转写预览，无选区继续录音原文原写 |

## 涉及文件

- `src/capabilities/input/SelectedTextInputPort.ts` — 新增选区输入抽象及剪贴板恢复逻辑
- `src/capabilities/input/SelectedTextInputPort.test.ts` — 覆盖选区读取、无选区和复制失败恢复
- `src/infrastructure/input/TauriSelectedTextInput.ts` — 接入 Tauri 剪贴板与窗口焦点能力
- `src-tauri/src/output.rs` — 新增 Windows `Ctrl+C` 输入命令
- `src-tauri/src/lib.rs` — 注册 `send_copy` 命令
- `src/App.tsx` — 首次快捷键按下时优先尝试选区转写，无选区回退录音

## 核心改动

- 选中文字后按右 Alt，系统读取选区并进入 `PROCESSING`。
- 选区内容复用已有 LLM 转写和浮窗预览/复制流程，不自动写回原窗口。
- 没有选区、读取失败或当前环境不支持选区读取时，保持原来的录音流程。
- 复制选区后尽力恢复用户原剪贴板；复制异常也不会遗留临时内容。

## 验证

- `npm run build` — Vite 生产构建通过 ✅
- `npm test -- --run` — 21 个测试文件、65 个测试全部通过 ✅
- `cargo check --manifest-path src-tauri/Cargo.toml` — Rust 检查通过 ✅
- `git diff --check` — 无差异格式错误 ✅
