# 变更记录 #032 — 2026-08-18

## 概要

| 标签 | 等级 | 根因 | 方案 |
|---|---|---|---|
| feature, retrieval, capability | 🟡 中 | 搜索结果还没有被编排成可引用的答案，且缺少单次调用约束 | 新增 RetrievalService，执行一次搜索、一次 LLM 生成，并返回答案与来源 |

## 涉及文件

- Create: `src/capabilities/retrieval/RetrievalService.ts`
- Create: `src/capabilities/retrieval/RetrievalService.test.ts`

## 核心改动

- 校验空查询和空搜索结果。
- 将标题、摘要、链接按编号注入 LLM 上下文。
- 使用当前活动 LLM Provider 和模型，设置低温度与 800 token 输出上限。
- 返回 `{ answer, sources }`，为结果面板引用来源做准备。
- 将取消信号同时传给搜索 Provider 和 LLM Provider。

## 验证

- 命令: `npx vitest --run src/capabilities/retrieval/RetrievalService.test.ts --pool=forks --poolOptions.forks.singleFork=true --no-file-parallelism`
- 结果: 1 个测试文件、4 个测试全部通过 ✅；确认一次搜索和一次 LLM 调用

