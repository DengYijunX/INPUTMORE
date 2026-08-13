# 变更记录 #017 — 2026-08-13

## 概要

| 标签 | 等级 | 根因 | 方案 |
|---|---|---|---|
| feature, interaction, feedback | 🟢 低 | 等待阶段只有静态 PROCESSING 文案，无法直观看到任务仍在进行 | 增加不展示中间结果的轻量加载点动画，并提供可访问状态文本 |

## 涉及文件

- Create: `src/presentation/ProcessingIndicator.tsx` — 等待阶段指示器
- Create: `src/presentation/ProcessingIndicator.test.tsx` — 指示器行为测试
- Modify: `src/App.tsx` — 在识别 / 处理状态显示指示器
- Modify: `src/App.css` — 点动画、降动画偏好和视觉样式

## 核心改动

- 录音中仍显示 REC 和波形。
- 识别 / 整理中显示 PROCESSING 和三点呼吸动画。
- 动画不展示中间识别文本，不改变写回时机。
- 支持 `prefers-reduced-motion`，用户关闭动态效果时保持静态显示。

## 验证

- 命令: `npm run build`
- 结果: Vite production build 通过 ✅
- 命令: `npm test -- --run --reporter=dot`
- 结果: 13 个测试文件、33 个测试全部通过 ✅
