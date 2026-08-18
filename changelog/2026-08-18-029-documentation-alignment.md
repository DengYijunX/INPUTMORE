# 变更记录 #029 — 2026-08-18

## 概要

| 标签 | 等级 | 根因 | 方案 |
|---|---|---|---|
| docs | 🟡 中 | 早期设计仍将默认流程描述为“优化转写后自动写回”，且把尚未实现的翻译、Ask、检索列为当前 MVP 功能 | 同步主设计、历史计划说明和当前产品状态路线图，区分已实现能力与后续能力 |

## 涉及文件

- Create: `docs/product-status-and-roadmap.md` — 当前功能边界、快捷键和后续路线
- Modify: `docs/superpowers/specs/2026-08-12-ai-input-layer-design.md` — 对齐 Raw Write、Enhance、选区转写和检索规划
- Modify: `docs/superpowers/plans/2026-08-12-ai-input-layer-mvp.md` — 标记为历史计划并说明当前执行边界

## 核心改动

- 明确右 Alt 为原文原写入口。
- 明确 `Ctrl + 右 Alt` 和浮窗“文本”入口为转写 / 整理入口。
- 明确转写结果当前只在浮窗预览并由用户复制。
- 将检索 / 问答、翻译、Prompt 改写等标记为后续能力。
- 历史 changelog 保持不变。

