# 变更记录 #022 — 2026-09-10

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, accessibility | 🟡 中 | 展开预览中的耗时使用默认段落间距和较大的继承字号，压缩了结果阅读区 | 将耗时改为紧凑辅助信息，并适度增加展开结果区高度 |

## 涉及文件

- Modify: `src/App.css` — 调整预览结果、提示和耗时的垂直空间分配

## 核心改动

- 将展开态 `.preview-text` 最大高度从 `136px` 调整为 `176px`，给长结果更多可视区域。
- 将 `.preview-hint` 的字号、行高和上间距压缩，降低辅助提示的空间占用。
- 新增 `.preview-duration` 样式，将处理耗时作为低强调辅助信息展示。

## 验证

- 命令: `npx vitest --run --reporter=dot`
- 结果: 40 个测试文件、124 个测试全部通过 ✅
- 命令: `npm run build`
- 结果: TypeScript 检查和 Vite 构建通过 ✅
- 命令: `cargo check --manifest-path src-tauri/Cargo.toml`
- 结果: Rust 检查通过 ✅

