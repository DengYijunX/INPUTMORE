# 变更记录 #012 — 2026-08-17

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, output | 🔴 高 | 目标窗口恢复焦点失败时仍继续发送 Ctrl+V，可能将结果写入其他前台应用 | 焦点恢复失败立即停止写回，并在 Windows 端校验前台窗口句柄 |

## 涉及文件

- Modify: `src/infrastructure/output/TauriTextOutput.ts` — 不再吞掉焦点恢复错误，返回 `target_unavailable`。
- Modify: `src/infrastructure/output/TauriTextOutput.test.ts` — 验证焦点失败时不发送粘贴。
- Modify: `src-tauri/src/output.rs` — `SetForegroundWindow` 后确认当前前台窗口与目标句柄一致。
- Create: `changelog/2026-08-17-012-focus-safe-writeback.md` — 记录本次变更。

## 核心改动

- 目标窗口无法恢复时，不再继续发送 Ctrl+V。
- 目标失效时仍返回写回失败状态，由现有“复制文本”兜底。
- 目标窗口已经在前台时仍可正常通过校验。

## 验证

- `npm test -- --run`：19 个测试文件、57 个测试通过。
- `npm run build`：通过。
- `cargo check --manifest-path src-tauri/Cargo.toml`：通过。
