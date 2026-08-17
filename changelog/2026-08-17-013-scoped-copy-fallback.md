# 变更记录 #013 — 2026-08-17

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, output | 🟡 中 | 错误状态复用全局上次结果，导致复制按钮和复制内容可能属于上一轮会话 | 将可复制文本绑定到当前错误状态，仅写回失败时提供复制兜底 |

## 涉及文件

- Modify: `src/domain/actions.ts` — 为错误状态和失败事件增加可选 `copyText`。
- Modify: `src/state/sessionMachine.ts` — 透传当前失败事件的复制文本。
- Modify: `src/state/sessionMachine.test.ts` — 增加复制兜底归属测试。
- Modify: `src/App.tsx` — 删除全局上次结果引用，复制按钮只在当前错误有文本时显示，并增加复制成功反馈。
- Create: `changelog/2026-08-17-013-scoped-copy-fallback.md` — 记录本次变更。

## 核心改动

- 写回失败时仅绑定本轮整理结果。
- 麦克风、ASR、模型、焦点等其他错误不显示复制按钮。
- 复制成功后短暂显示“已复制”。
- 新会话不会复用上一轮整理文本。

## 验证

- `npm test -- --run`：19 个测试文件、58 个测试通过。
- `npm run build`：通过。
- `cargo check --manifest-path src-tauri/Cargo.toml`：通过。
