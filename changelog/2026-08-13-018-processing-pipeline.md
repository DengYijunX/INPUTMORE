# 变更记录 #018 — 2026-08-13

## 概要

| 标签 | 等级 | 根因 | 方案 |
|---|---|---|---|
| feature, architecture | 🟡 中 | ASR 与文本整理仍由浮窗事件处理，后续接入 Paraformer 时会把 Provider 细节带入 UI | 抽取单次处理管线，统一执行最终转写和一次文本整理 |

## 涉及文件

- Create: `src/application/InputProcessingPipeline.ts` — ASR → 文本整理的应用层编排
- Create: `src/application/InputProcessingPipeline.test.ts` — 管线行为测试

## 核心改动

- `InputProcessingPipeline` 接收 `Transcriber` 和 `TextTransformer` 两个端口。
- 每次任务只调用一次转写和一次文本整理。
- 对最终转写文本做 trim 和空结果校验。
- 支持统一传递 `AbortSignal`，方便取消整个处理链路。

## 验证

- 命令: `npm run build`
- 结果: Vite production build 通过 ✅
- 命令: `npm test -- --run --reporter=dot`
- 结果: 14 个测试文件、34 个测试全部通过 ✅
