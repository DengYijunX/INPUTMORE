# 变更记录 #021 — 2026-09-10

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, accessibility | 🟡 中 | 预览外层的 `62vh` 高度上限与内容自适应窗口形成裁切，且结果滚动条没有统一轨道样式 | 移除预览外层高度上限，只保留结果内容内部滚动，并使用透明轨道和暖灰滑块 |

## 涉及文件

- Modify: `src/App.css` — 修复预览容器高度边界和结果滚动条样式

## 核心改动

- 移除 `.preview-panel` 的 `max-height: min(62vh, 520px)`，避免浮窗高度与内容高度互相限制。
- 为 `.preview-text` 增加 Firefox 和 WebKit 滚动条样式，滚动轨道保持透明。
- 将展开态滚动限制在结果内容区域，并隐藏横向滚动。

## 验证

- 命令: `npx vitest --run --reporter=dot`
- 结果: 40 个测试文件、124 个测试全部通过 ✅
- 命令: `npm run build`
- 结果: TypeScript 检查和 Vite 构建通过 ✅
- 命令: `cargo check --manifest-path src-tauri/Cargo.toml`
- 结果: Rust 检查通过 ✅

