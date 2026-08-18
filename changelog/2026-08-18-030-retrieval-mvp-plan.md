# 变更记录 #030 — 2026-08-18

## 概要

| 标签 | 等级 | 根因 | 方案 |
|---|---|---|---|
| feature, retrieval, architecture, docs | 🟡 中 | 检索能力尚无独立 Provider、业务服务、状态流和结果面板设计 | 先制定文本检索 MVP 计划：可配置 HTTP 搜索、一次搜索、一次 LLM 答案生成、同窗口滚动结果展示 |

## 涉及文件

- Create: `docs/superpowers/plans/2026-08-18-retrieval-mvp.md` — 检索 MVP 分任务实施计划

## 核心改动

- 明确 `SearchProvider`、`RetrievalService`、HTTP 搜索适配器和应用流程的职责边界。
- 明确检索第一版只支持文本入口，不修改右 Alt、选区转写和 ASR 链路。
- 明确检索结果复用当前 Tauri 窗口，以有上限的滚动面板展示，不创建第二个原生窗口。
- 明确每次检索最多一次搜索请求和一次 LLM 请求。

## 验证

- 命令: `rg -n "TBD|TODO|if needed|corresponding|appropriate|later|待" docs/superpowers/plans/2026-08-18-retrieval-mvp.md`
- 结果: 无未解决占位词；计划自检通过 ✅

