# 变更记录 #031 — 2026-08-18

## 概要

| 标签 | 等级 | 根因 | 方案 |
|---|---|---|---|
| feature, retrieval, provider | 🟡 中 | 检索功能缺少统一搜索接口和第一个可用的国内网页搜索实现 | 新增 SearchProvider 契约，并接入智谱 Web Search API 适配器 |

## 涉及文件

- Create: `src/capabilities/retrieval/SearchProvider.ts` — 统一搜索结果结构
- Create: `src/capabilities/retrieval/SearchProvider.test.ts` — 搜索接口契约测试
- Create: `src/infrastructure/providers/search/ZhipuWebSearch.ts` — 智谱 Web Search HTTP 适配器
- Create: `src/infrastructure/providers/search/ZhipuWebSearch.test.ts` — 请求、规范化和错误测试

## 核心改动

- 使用统一的 `SearchResult` 表达标题、链接、摘要、来源和发布时间。
- 调用智谱 `POST /paas/v4/web_search`，默认使用 `search_std`、5 条结果和 medium 内容量。
- 将智谱的 `search_result` 字段映射为上层 Provider 无关的结果。
- API Key、HTTP 状态和无效响应均转换为现有 `ProviderError`。

## 验证

- 命令: `npx vitest --run src/capabilities/retrieval/SearchProvider.test.ts src/infrastructure/providers/search/ZhipuWebSearch.test.ts --pool=forks --poolOptions.forks.singleFork=true --no-file-parallelism`
- 结果: 2 个测试文件、4 个测试全部通过 ✅

