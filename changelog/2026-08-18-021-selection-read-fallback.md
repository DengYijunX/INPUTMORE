# 变更记录 #021 — 2026-08-18

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, compatibility | 🟡 中 | 剪贴板序列号属于辅助校验，其命令不可用时被错误地当成选区读取失败 | 将序列号读取改为 best-effort，失败时继续使用临时哨兵值判断选区 |

## 涉及文件

- `src/capabilities/input/SelectedTextInputPort.ts` — 序列号读取异常降级
- `src/capabilities/input/SelectedTextInputPort.test.ts` — 覆盖序列号不可用场景

## 核心改动

- 剪贴板序列号读取失败不再中断选区读取流程。
- 临时哨兵值仍作为无选区判断的主要依据。
- 真正的剪贴板读取、窗口焦点和 Ctrl+C 失败仍会保留错误处理。

## 验证

- `npm test -- --run` — 22 个测试文件、69 个测试全部通过 ✅
- `npm run build` — Vite 生产构建通过 ✅
- `cargo check --manifest-path src-tauri/Cargo.toml` — 通过 ✅
- `git diff --check` — 无差异格式错误 ✅
