# 变更记录 #009 — 2026-08-14

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, output | 🔴 高 | 右 Alt 重复按下可启动重复处理链，且剪贴板在目标应用完成粘贴前被恢复 | 原生去重、前端会话锁、剪贴板内容校验后再恢复，并保留目标窗口用于撤回 |

## 涉及文件

- Modify: `src-tauri/src/shortcut.rs` — 过滤右 Alt 的重复 keydown/keyup。
- Modify: `src/App.tsx` — 增加单次停止锁，避免同一录音启动多条处理链；写回成功后保留目标窗口。
- Modify: `src/infrastructure/output/TauriTextOutput.ts` — 延长粘贴等待时间，并在恢复原剪贴板前确认用户没有修改剪贴板。
- Modify: `src/infrastructure/output/TauriTextOutput.test.ts` — 增加剪贴板竞争场景测试。

## 核心改动

- 重复 `pressed` 不再重复触发 `capture.stop()`。
- 一次录音只允许一条转录、文本处理和写回链路。
- 目标应用仍在读取 B 时，不会过早恢复 A。
- 如果用户在写回期间复制了新内容，则不覆盖用户的新剪贴板。
- 写回完成后保留目标窗口上下文，支持后续撤回；超时或取消时再清理。

## 验证

- `npm test -- --run`：19 个测试文件、55 个测试通过。
- `npm run build`：通过。
- `cargo check --manifest-path src-tauri/Cargo.toml`：通过。
- `cargo test --manifest-path src-tauri/Cargo.toml shortcut::tests`：2 个测试通过。
