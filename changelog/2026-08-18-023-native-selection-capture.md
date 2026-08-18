# 变更记录 #023 — 2026-08-18

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, feature, compatibility | 🔴 高 | 选区读取依赖 WebView 剪贴板纯文本接口，无法稳定处理 Codex 富文本、网页复制延迟和旧剪贴板误读 | 将选区捕获整体下沉到 Windows 原生层，使用系统剪贴板序列号和 Unicode/HTML 格式读取 |

## 涉及文件

- `src-tauri/src/output.rs` — 新增原生选区捕获命令和 HTML 转文本
- `src-tauri/src/lib.rs` — 注册原生选区捕获命令
- `src-tauri/Cargo.toml`、`src-tauri/Cargo.lock` — 接入 `clipboard-win`
- `src/infrastructure/input/TauriSelectedTextInput.ts` — 改为调用原生选区捕获命令

## 核心改动

- 原生记录 Ctrl+C 前后的系统剪贴板序列号，不再读写旧剪贴板或写入哨兵值。
- 序列号未变化时直接判断无选区，避免旧 UUID 被送入 LLM。
- 支持 `CF_UNICODETEXT` 和 `HTML Format`，兼容网页和富文本应用。
- 原生等待最多 600ms，覆盖浏览器异步写入剪贴板的延迟。
- 选区读取后不修改用户原剪贴板内容。

## 验证

- `npm test -- --run` — 23 个测试文件、70 个测试全部通过 ✅
- `npm run build` — Vite 生产构建通过 ✅
- `cargo test --manifest-path src-tauri/Cargo.toml` — 5 个 Rust 测试通过 ✅
- `cargo check --manifest-path src-tauri/Cargo.toml` — 通过 ✅
- `git diff --check` — 无差异格式错误 ✅
