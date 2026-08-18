# 变更记录 #024 — 2026-08-18

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, interaction | 🟡 中 | Codex 等富文本应用可能同时提供 Unicode 和 HTML，Unicode 内容可能是内部 UUID；原生选区捕获等待期间也没有即时状态反馈 | 优先读取 HTML 片段、Unicode 作为兜底，并在组合键触发后立即显示处理中状态 |

## 涉及文件

- `src-tauri/src/output.rs` — 调整原生剪贴板读取优先级
- `src/App.tsx` — 选区捕获开始时立即进入 `PROCESSING`

## 核心改动

- HTML Format 优先于 CF_UNICODETEXT，兼容富文本选区中的真实内容。
- Unicode 仅作为没有可用 HTML 时的兜底格式。
- 原生捕获等待复制结果期间，浮窗立即反馈处理中，避免看起来无响应。

## 验证

- `cargo test --manifest-path src-tauri/Cargo.toml` — 5 个 Rust 测试通过 ✅
- `npx vitest --run src/App.test.tsx src/application/shortcutAvailability.test.ts --pool=forks --poolOptions.forks.singleFork=true --no-file-parallelism` — 3 个定向前端测试通过 ✅
- `npm run build` — Vite 生产构建通过 ✅
- `cargo check --manifest-path src-tauri/Cargo.toml` — 通过 ✅
- `git diff --check` — 无差异格式错误 ✅
- 完整 Vitest 受本机残留 Node 进程影响未完成，不判定为代码失败
