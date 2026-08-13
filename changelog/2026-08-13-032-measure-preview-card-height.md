# 变更记录 #032 — 2026-08-13

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, visual | 🔴 高 | 通过 `document.documentElement.scrollHeight` 调整窗口高度时，根节点固定为 `height: 100%`，实际测到的是当前窗口高度而不是结果卡片高度 | 直接观察结果卡片的真实布局高度，并移除根节点固定高度约束 |

## 涉及文件

- `src/App.tsx` — 为浮窗卡片增加 `ResizeObserver`，按真实卡片高度更新 Tauri 窗口
- `src/App.css` — 取消 `html/body/#root/app-shell` 的固定高度，避免内容被父级裁切

## 核心改动

- 使用 `floatingCardRef.current.getBoundingClientRect().height` 计算实际内容高度。
- 结果展开、收起以及内容变化时自动触发窗口尺寸更新。
- 保留窗口最小高度 90px，并额外预留上下 20px 页面内边距。
- 移除根节点和 app shell 的 `height: 100%`，使结果卡片可以自然撑开页面。

## 验证

- 命令：`npx tsc --noEmit`
- 结果：通过 ✅
- 命令：`npm test -- --run --reporter=dot`
- 结果：16 个测试文件、44 个测试全部通过 ✅
- 命令：`npm run build`
- 结果：Vite 生产构建通过 ✅
