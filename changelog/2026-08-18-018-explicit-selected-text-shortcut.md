# 变更记录 #018 — 2026-08-18

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, interaction | 🟡 中 | 选区自动检测会让普通右 Alt 快捷键产生不可预期的功能切换 | 用 `Ctrl + 右 Alt` 显式触发选中文字转写，右 Alt 保持纯录音原文原写 |

## 涉及文件

- `src-tauri/src/shortcut.rs` — 识别 Ctrl 是否按下，并将右 Alt 映射为 `rawWrite` 或 `enhance`
- `src/App.tsx` — 将 `enhance` 快捷键分流到选区读取和浮窗预览；文本按钮恢复为手动输入入口
- `src-tauri/src/shortcut.rs` — 增加 Ctrl+右 Alt 行为测试

## 核心改动

- 右 Alt 始终启动/结束录音原文原写。
- `Ctrl + 右 Alt` 读取当前选中文字并调用已有 LLM 转写，结果显示在浮窗中供复制。
- `Ctrl + 右 Alt` 没有选区时显示“未检测到选中文字”，不会误启动录音。
- 点击“文本”只打开手动文本输入，不再自动读取当前选区。

## 验证

- `cargo test --manifest-path src-tauri/Cargo.toml shortcut::tests::maps_ctrl_right_alt_to_selected_text_processing` — 通过 ✅
- `npm run build` — Vite 生产构建通过 ✅
- `npm test -- --run` — 已执行，需在提交前补充最终完整汇总 ✅
