# 变更记录 #015 — 2026-09-10

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| refactor, bugfix | 🟢 低 | 输入框沿用浏览器原生 resize 手柄和滚动条，视觉上与浮窗组件不一致 | 禁用 textarea 手动 resize，限制最大高度，并使用细窄的暖灰滚动条 |

## 涉及文件

- Modify: `src/App.css` — 为输入框增加最大高度、内部滚动和暖灰细滚动条样式。

## 核心改动

- textarea 改为 `resize: none`，移除右下角原生拖拽手柄；
- 长文本在 `180px` 最大高度内滚动；
- WebView2 滚动条使用透明轨道和细暖灰滑块；
- 不改变输入框默认高度、提交逻辑或任何业务流程。

## 验证

- 桌面端 CDP：`resize=none`、`overflow-y=auto`、`max-height=180px`；长文本未造成横向溢出 ✅
- 命令：`npx vitest --run --reporter=dot`
  - 结果：39 个测试文件、120 个测试通过 ✅
- 命令：`npm run build`
  - 结果：TypeScript 检查和 Vite 生产构建通过 ✅
