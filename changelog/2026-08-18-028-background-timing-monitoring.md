# 变更记录 #028 — 2026-08-18

## 概要

| 标签 | 等级 | 根因 | 方案 |
|---|---|---|---|
| feature, observability, performance | 🟡 中 | 用户感知的是快捷键触发到结果出现的总耗时，但现有统计只覆盖 LLM 请求，无法定位选区捕获、修饰键释放等待或模型请求的瓶颈 | 在后台输出结构化端到端计时，不改变浮窗视觉和交互 |

## 涉及文件

- Modify: `src/App.tsx` — 记录手动文本和选区文本的总耗时、选区捕获耗时、模型耗时
- Create: `src/application/timing.ts` — 统一耗时记录结构和取整逻辑
- Create: `src/application/timing.test.ts` — 后台计时记录测试
- Modify: `src/capabilities/text/TextTransformationService.test.ts` — 保持短文本、长文本单次调用校验

## 核心改动

- 输出 `[InputMore timing]` 结构化日志。
- 选区转写记录 `totalMs`、`captureMs`、`modelMs`。
- 手动文本转写记录 `totalMs`、`modelMs`。
- 无选区时也记录捕获耗时，便于识别系统等待是否过长。
- 不在浮窗增加总耗时展示；用户界面仍只保留原有模型耗时。

## 验证

- 命令: `npx vitest --run src/App.test.tsx src/application/shortcutAvailability.test.ts src/application/timing.test.ts src/capabilities/text/TextTransformationService.test.ts --pool=forks --poolOptions.forks.singleFork=true --no-file-parallelism`
- 结果: 4 个测试文件、11 个测试全部通过 ✅
- 命令: `npm run build`
- 结果: TypeScript 检查和 Vite 生产构建通过 ✅

