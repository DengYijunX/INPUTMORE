# 变更记录 #006 — 2026-08-12

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, feature | 🟡 中 | 无边框窗口没有拖动区域，窗口背景与卡片层产生视觉叠加 | 配置透明背景与无阴影，并把品牌标题栏标记为 Tauri 拖动区域 |

## 涉及文件

- Modify: `src/App.tsx`
- Modify: `src/App.css`
- Modify: `src-tauri/tauri.conf.json`

## 核心改动

- 在 `InputMore` 顶部标题区域增加 `data-tauri-drag-region`。
- 设置标题区域的 grab/grabbing 光标反馈。
- 设置 Tauri `backgroundColor` 为透明并关闭系统阴影。
- 收紧外层 padding，减少透明窗口与卡片的错觉叠加。

## 验证

- 命令: `npm test -- --run src/App.test.tsx`
- 结果: 1 个测试通过 ✅
- 命令: `npm run build`
- 结果: 前端生产构建通过 ✅
- 命令: `cargo check --manifest-path src-tauri/Cargo.toml`
- 结果: Tauri Rust 编译检查通过 ✅
