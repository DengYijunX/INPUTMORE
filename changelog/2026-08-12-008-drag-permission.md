# 变更记录 #008 — 2026-08-12

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, security | 🟡 中 | Tauri 2 的 `startDragging` 命令未获得 ACL capability 授权 | 为主窗口授予 `core:window:allow-start-dragging` |

## 涉及文件

- Create: `src-tauri/capabilities/default.json`
- Modify: `src/App.tsx`

## 核心改动

- 为 `main` 窗口启用窗口拖动命令权限。
- 为拖动调用增加错误日志，便于后续区分事件未触发与权限拒绝。

## 验证

- 命令: `npm run build`
- 结果: TypeScript 检查与 Vite 生产构建通过 ✅
- 命令: `cargo check --manifest-path src-tauri/Cargo.toml`
- 结果: Tauri Rust 编译检查通过 ✅
