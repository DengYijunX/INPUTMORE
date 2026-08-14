# 变更记录 #004 — 2026-08-14

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, refactor | 🔴 高 | 目标输入窗口在前端收到快捷键后才捕获，可能已经被浮窗或其他窗口取代 | 在 Rust 全局快捷键按下事件源头捕获前台窗口，并随事件传递给前端 |

## 涉及文件

- `src-tauri/src/lib.rs` — 在快捷键按下回调内捕获目标窗口句柄。
- `src/application/shortcutEvents.ts` — 支持携带目标窗口 ID。
- `src/application/shortcutEvents.test.ts` — 增加目标窗口传递回归测试。
- `src/domain/actions.ts` — 扩展快捷键领域事件携带目标窗口 ID。
- `src/App.tsx` — 使用事件中的目标窗口，不再延迟调用前台窗口捕获。

## 核心改动

- 快捷键 `Pressed` 事件产生时立即调用 `GetForegroundWindow()`。
- 目标窗口 ID 通过 `inputmore://shortcut` payload 传到前端。
- 前端第一次快捷键直接建立 `targetRef` 并开始录音。
- 没有目标窗口 ID 时显示“没有可用的输入位置”，不会启动录音。

## 验证

- `npm test -- --run src/application/shortcutEvents.test.ts src/state/sessionMachine.test.ts`：10 个测试通过。
- `npm run build`：通过。
- `cargo check --manifest-path src-tauri/Cargo.toml`：通过。
- 完整测试套件：待最终命令完成后补充。
