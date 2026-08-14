# 变更记录 #005 — 2026-08-14

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, bugfix | 🟡 中 | 写回成功后会停留在 DONE，下一次快捷键无法进入录音 | 增加可测试的 `reset` 事件，DONE 展示 1 秒后自动回到 READY |

## 涉及文件

- `src/domain/actions.ts` — 增加 `reset` 会话事件。
- `src/state/sessionMachine.ts` — 支持 `completed + reset → idle`。
- `src/state/sessionMachine.test.ts` — 增加自动复位行为测试。
- `src/App.tsx` — 增加 DONE 状态定时复位。

## 核心改动

- 写回完成后保留 DONE 反馈约 1 秒。
- 定时器触发状态机 `reset`，返回 READY。
- 组件卸载或状态变化时清理定时器，避免误复位其他会话。

## 验证

- `npm test -- --run src/state/sessionMachine.test.ts`：8 个测试通过。
- `npm run build`：通过。
- 完整测试套件：待最终命令完成后补充。
