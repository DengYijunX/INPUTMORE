# 变更记录 #011 — 2026-08-17

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, output | 🔴 高 | 写回适配器没有接收会话取消信号，取消后异步粘贴仍可能继续执行 | 为写回和撤回接口增加 `AbortSignal`，在各异步阶段检查取消状态 |

## 涉及文件

- Modify: `src/capabilities/output/TextOutputPort.ts` — 为写回/撤回接口增加可选取消信号。
- Modify: `src/infrastructure/output/TauriTextOutput.ts` — 在剪贴板、焦点、粘贴、等待和撤回阶段响应取消。
- Modify: `src/infrastructure/output/TauriTextOutput.test.ts` — 增加取消前不写入、不粘贴测试。
- Modify: `src/App.tsx` — 将当前处理控制器的 `AbortSignal` 传递给写回适配器。

## 核心改动

- 取消发生在写回前时，不读取或修改剪贴板。
- 取消发生在写回过程中时，适配器返回 `cancelled`，并尽量恢复原剪贴板。
- App 通过 `AbortSignal` 和会话版本双重校验，忽略取消后的晚到结果。
- 撤回接口保持兼容，并支持后续增加取消控制。

## 验证

- `npm test -- --run`：19 个测试文件、57 个测试通过。
- `npm run build`：通过。
- `cargo check --manifest-path src-tauri/Cargo.toml`：通过。
