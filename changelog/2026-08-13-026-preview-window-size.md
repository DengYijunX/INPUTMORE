# 变更记录 #026 — 2026-08-13

## 概要

| 标签 | 等级 | 根因 | 方案 |
|---|---|---|---|
| bugfix, interaction | 🟡 中 | 预览内容变多后，主浮窗仍固定为 380×90，导致底部内容被裁切 | 根据会话状态动态调整 Tauri 窗口尺寸，并限制超长预览内容在内部滚动 |

## 涉及文件

- Modify: `src/App.tsx` — 预览状态调整窗口到 420×190，其他状态恢复 380×90
- Modify: `src/App.css` — 预览内容增加最大高度和内部滚动

## 验证

- 命令: `npm test -- --run --reporter=dot`
- 结果: 16 个测试文件、44 个测试全部通过 ✅
- 命令: `npm run build`
- 结果: Vite production build 通过 ✅
