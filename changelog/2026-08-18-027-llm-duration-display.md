# 变更记录 #027 — 2026-08-18

## 概要

| 标签 | 等级 | 根因 | 方案 |
|---|---|---|---|
| feature, observability, text | 🟡 中 | 文本转写只有处理中动画，无法区分模型请求慢和外围流程慢；调用次数缺少明确回归校验 | 对单次 `provider.generate()` 计时并在整理结果中展示，同时覆盖短文本和长文本的单次调用测试 |

## 涉及文件

- Modify: `src/App.tsx` — 记录模型处理耗时并展示在展开后的整理结果中
- Modify: `src/domain/actions.ts` — 为预览状态增加可选耗时字段
- Create: `src/presentation/formatDuration.ts` — 统一毫秒/秒显示格式
- Create: `src/presentation/formatDuration.test.ts` — 耗时格式测试
- Modify: `src/capabilities/text/TextTransformationService.test.ts` — 验证短文本、长文本都只调用模型一次

## 核心改动

- 在 `transformTextToPreview` 中只包住 `transform()` 调用计时，不把选区读取或 UI 渲染混入模型耗时。
- 整理结果展开后显示 `处理耗时：xxxms` 或 `x.xs`。
- 文本转写服务的测试现在明确断言模型调用次数为 1。

## 验证

- 命令: `npx vitest --run src/capabilities/text/TextTransformationService.test.ts src/presentation/formatDuration.test.ts --pool=forks --poolOptions.forks.singleFork=true --no-file-parallelism`
- 结果: 2 个测试文件、9 个测试全部通过 ✅；短文本和长文本均确认只调用模型 1 次
- 命令: `npm run build`
- 结果: TypeScript 检查和 Vite 生产构建通过 ✅

