# 变更记录 #011 — 2026-08-13

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, design | 🟡 中 | 视觉方向已确认，但代码仍是固定的大卡片 | 将 Warm Gray Glass 动态胶囊、日夜主题和状态尺寸关系落到浮窗实现 |

## 涉及文件

- Create: `docs/design/floating-capsule-visual-baseline.md`
- Modify: `src/App.tsx`, `src/App.css`, `src/App.test.tsx`
- Modify: `src-tauri/tauri.conf.json`

## 核心改动

- Idle、Recording、Processing、Completed 使用不同的胶囊宽度和信息密度。
- 日间使用暖银 / 象牙磨砂玻璃，夜间使用烟熏暖灰玻璃。
- Processing 显示 `×` 取消按钮。
- 外层 Tauri 窗口从 420×180 收紧为 380×90，减少透明区域。
- 保存已确认的视觉基线与后续实现边界。

## 验证

- 命令: `npm test -- --run`
- 结果: 7 个测试文件、21 个测试全部通过 ✅
- 命令: `npm run build`
- 结果: TypeScript 检查与 Vite 生产构建通过 ✅
