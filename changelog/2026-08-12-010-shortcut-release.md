# 变更记录 #010 — 2026-08-12

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix | 🟡 中 | 前端只处理快捷键 `pressed` 事件，忽略了 `released` 事件 | 将释放事件转换为状态机的 `recording_stopped` 事件 |

## 涉及文件

- Modify: `src/application/shortcutEvents.ts`
- Modify: `src/application/shortcutEvents.test.ts`
- Modify: `src/App.tsx`

## 核心改动

- 新增 `toSessionEvent()`，按下进入录音，录音中释放进入转录状态。
- 浮窗新增“正在识别”和“正在准备转写”提示。
- 当前使用 `pending-audio` 占位，真实音频采集将在下一阶段接入。

## 验证

- 命令: `npm test -- --run src/application/shortcutEvents.test.ts src/App.test.tsx`
- 结果: 3 个测试通过 ✅
- 命令: `npm run build`
- 结果: 前端生产构建通过 ✅
