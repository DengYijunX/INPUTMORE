# 变更记录 #006 — 2026-08-14

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, bugfix | 🟡 中 | 自动写回后没有明确的撤回入口 | 增加输出端口撤回能力、Windows `Ctrl+Z` 命令和 DONE 状态撤回按钮 |

## 涉及文件

- `src/capabilities/output/TextOutputPort.ts` — 增加 `undoText` 接口。
- `src/infrastructure/output/TauriTextOutput.ts` — 实现目标窗口恢复和撤回输入。
- `src-tauri/src/output.rs` — 增加 Windows `send_undo` 命令。
- `src-tauri/src/lib.rs` — 注册撤回命令。
- `src/App.tsx` — DONE 状态显示撤回按钮并处理结果。
- `src/App.css` — 增加撤回按钮样式。
- `src/infrastructure/output/TauriTextOutput.test.ts` — 增加撤回时序测试。

## 核心改动

- 写回成功后保留目标窗口上下文 3 秒，供用户完成撤回操作。
- 点击撤回时发送 `Ctrl+Z`，成功后立即回到 READY。
- DONE 自动复位时清理目标上下文，避免过期撤回。
- 撤回失败时提示用户手动撤销，不修改当前状态内容。

## 验证

- 定向测试：13 个测试通过。
- `npm run build`：通过。
- `cargo check --manifest-path src-tauri/Cargo.toml`：通过。
- 完整测试套件：待最终命令完成后补充。
