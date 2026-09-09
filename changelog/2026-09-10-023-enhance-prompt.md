# 变更记录 #023 — 2026-09-10

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, test, docs | 🟡 中 | 原 `enhance` Prompt 偏向语音转写清理，限制了结构重组、表达完善和任务说明整理能力 | 换成面向通用用户输入的增强规则，允许在不改变意图的前提下重组、润色、补全隐含逻辑和自然结构化 |

## 涉及文件

- Modify: `src/capabilities/text/textPrompts.ts` — 更新 `enhance` 系统 Prompt 和用户 Prompt
- Modify: `src/capabilities/text/textPrompts.test.ts` — 增加新 Prompt 约束断言
- Modify: `src/capabilities/text/TextTransformationService.test.ts` — 更新整理请求断言

## 核心改动

- 系统 Prompt 从“谨慎的桌面输入增强助手”调整为理解用户真实意图、保持核心意图和事实、输出清晰自然结果的通用增强助手。
- 用户 Prompt 允许重新组织结构、改善措辞、适度补全原文隐含逻辑，以及按需分段、列点或整理为任务说明。
- 保留“不回答问题、不添加无关信息、只输出最终结果”的边界。
- 未修改 `rawWrite` 默认原文写回、翻译和检索流程。

## 验证

- 命令: `npx vitest --run src/capabilities/text/textPrompts.test.ts src/capabilities/text/TextTransformationService.test.ts --reporter=dot`
- 结果: 2 个测试文件、7 个测试全部通过 ✅
- 命令: `npx vitest --run --reporter=dot`
- 结果: 40 个测试文件、124 个测试全部通过 ✅
- 命令: `npm run build`
- 结果: TypeScript 检查和 Vite 构建通过 ✅
- 命令: `cargo check --manifest-path src-tauri/Cargo.toml`
- 结果: Rust 检查通过 ✅

