# 变更记录 #007 — 2026-08-12

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix | 🟡 中 | 声明式 `data-tauri-drag-region` 在当前 Tauri/WebView 组合中没有触发窗口拖动 | 在标题栏指针按下时显式调用 `getCurrentWindow().startDragging()` |

## 涉及文件

- Create: `src/presentation/windowDrag.ts`
- Test: `src/presentation/windowDrag.test.ts`
- Modify: `src/App.tsx`

## 核心改动

- 仅主鼠标键触发拖动。
- 将 Tauri 窗口 API 注入纯拖动辅助函数，便于测试。
- 标题栏同时保留 `data-tauri-drag-region` 作为兼容兜底。

## 验证

- 命令: `npm test -- --run src/presentation/windowDrag.test.ts src/App.test.tsx`
- 结果: 2 个测试通过 ✅
- 命令: `npm run build`
- 结果: TypeScript 检查与 Vite 生产构建通过 ✅
