# 变更记录 #022 — 2026-08-13

## 概要

| 标签 | 等级 | 根因 | 方案 |
|---|---|---|---|
| bugfix, interaction | 🟡 中 | 浮窗使用的全局 `body { overflow: hidden }` 使独立设置页无法滚动 | 为设置页建立独立的 `100vh` 纵向滚动容器 |

## 涉及文件

- Modify: `src/App.css` — 设置页增加视口高度、纵向滚动和底部安全留白

## 验证

- 命令: `npm test -- --run --reporter=dot`
- 结果: 16 个测试文件、41 个测试全部通过 ✅
- 命令: `npm run build`
- 结果: Vite production build 通过 ✅
