# 变更记录 #025 — 2026-09-10

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, test, docs | 🟡 中 | 翻译 Prompt 只覆盖基础原意、语气和格式要求，对 Markdown、代码、链接、占位符和技术内容的保护规则不够明确 | 在翻译业务专属 Prompt 中补充结构保留、技术内容保护和只输出正文规则 |

## 涉及文件

- Modify: `src/capabilities/translation/translationPrompts.ts` — 强化翻译系统和用户 Prompt
- Modify: `src/capabilities/translation/translationPrompts.test.ts` — 增加结构化技术内容和可选指令测试

## 核心改动

- 系统 Prompt 明确翻译助手不回答问题、不解释、不扩写、不编造内容。
- 用户 Prompt 要求保留段落、换行、列表和 Markdown 结构。
- 明确代码、URL、变量名和占位符不翻译。
- 明确保留专有名词，除非上下文明确要求转换。
- 保留目标语言、源语言和额外翻译指令的独立边界。
- 未修改 `TranslationService`、`LlmProvider`、翻译目标语言配置和预览流程。

## 验证

- 命令: `npx vitest --run src/capabilities/translation/translationPrompts.test.ts src/capabilities/translation/TranslationService.test.ts --reporter=dot`
- 结果: 2 个测试文件、9 个测试全部通过 ✅
- 命令: `npx vitest --run --reporter=dot`
- 结果: 40 个测试文件、127 个测试全部通过 ✅
- 命令: `npm run build`
- 结果: TypeScript 检查和 Vite 构建通过 ✅
- 命令: `cargo check --manifest-path src-tauri/Cargo.toml`
- 结果: Rust 检查通过 ✅

