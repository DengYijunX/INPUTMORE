# 变更记录 #026 — 2026-08-18

## 概要

| 标签 | 等级 | 根因 | 方案 |
|---|---|---|---|
| bugfix, shortcut, selection | 🔴 高 | 选区捕获在 Ctrl/右 Alt 仍按下时立即发送模拟 Ctrl+C，目标应用收到的不是独立复制操作 | 在原生复制前轮询等待 Ctrl 和右 Alt 释放，超时直接失败，不发送可能被修饰键污染的复制 |

## 涉及文件

- Modify: `src-tauri/src/output.rs` — 增加修饰键释放等待和状态测试

## 核心改动

- `capture_selected_text` 在模拟复制前调用 `wait_for_shortcut_modifiers_release`。
- 使用 `GetAsyncKeyState` 检查 Ctrl 与右 Alt 的物理按键状态。
- 最多等待 1 秒；仍未释放时返回明确错误，避免误读或误复制。
- 新增 `shortcut_modifiers_released` 单元测试，覆盖任一修饰键仍按下和全部释放场景。

## 验证

- 命令: `cargo test --manifest-path src-tauri/Cargo.toml -- --nocapture`
- 结果: 7 个 Rust 测试全部通过 ✅
- 前端代码未改动；上一变更已验证 `npm run build` 通过。

