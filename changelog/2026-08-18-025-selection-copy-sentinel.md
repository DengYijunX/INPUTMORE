# 变更记录 #025 — 2026-08-18

## 概要

| 标签 | 等级 | 根因 | 方案 |
|---|---|---|---|
| bugfix, selection, clipboard | 🔴 高 | 模拟复制未可靠更新剪贴板时，捕获链路仍可能读取旧剪贴板内容；恢复焦点后立即发送按键也存在时序窗口 | 复制前写入唯一哨兵，聚焦目标窗口后等待，再仅接受脱离哨兵且序列号发生变化的剪贴板内容，并在结束后恢复原剪贴板 |

## 涉及文件

- Modify: `src-tauri/src/output.rs` — 强化 Windows 原生选区捕获与复制结果校验，增加回归测试

## 核心改动

- `capture_selected_text` 在模拟复制前写入本次操作专属哨兵，避免把历史 UUID 当成选区结果。
- 恢复目标窗口焦点后等待 40ms，再发送模拟 `Ctrl+C`；轮询窗口从 600ms 延长至 800ms。
- 新增 `fresh_selected_text`，拒绝空内容、哨兵内容和未发生序列变化的内容。
- 捕获结束后尽力恢复原剪贴板内容。
- 新增 `rejects_stale_clipboard_when_copy_only_leaves_the_sentinel` 回归测试。

## 验证

- 命令: `cargo test --manifest-path src-tauri/Cargo.toml`
- 结果: 6 个 Rust 测试全部通过 ✅
- 命令: `npx vitest --run src/App.test.tsx src/application/shortcutAvailability.test.ts --pool=forks --poolOptions.forks.singleFork=true --no-file-parallelism`
- 结果: 2 个测试文件、3 个测试全部通过 ✅
- 命令: `npm run build`
- 结果: TypeScript 检查和 Vite 生产构建全部通过 ✅

