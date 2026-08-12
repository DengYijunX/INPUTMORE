# 变更记录 #003 — 2026-08-12

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature | 🟢 低 | 状态机虽已存在，但用户还看不到录音、处理、结果和异常反馈 | 新增纯状态驱动浮窗展示层，所有外部调用通过回调注入 |

## 涉及文件

- Create: `src/presentation/FloatingWindow.tsx`
- Create: `src/presentation/StatusView.tsx`
- Test: `src/presentation/FloatingWindow.test.tsx`

## 核心改动

- 为录音状态显示“正在录音”和结束提示。
- 为转录/处理中状态显示可取消反馈。
- 为 Ask 结果显示内容和“插入答案”。
- 为失败状态显示错误、重试和取消。
- 组件不依赖 Provider、Tauri 或网络，只接收 `SessionState` 和行为回调。

## 验证

- 命令: `npm test -- --run`
- 结果: 5 个测试文件、17 个测试全部通过 ✅
- 命令: `npm run build`
- 结果: TypeScript 检查与 Vite 生产构建通过 ✅
