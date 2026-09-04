# 变更记录 #005 — 2026-09-04

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| refactor, test, docs | 🟡 中 | `enhance`、`translate`、`retrieval` 的 Prompt 嵌在各自 Service 中，业务规则与调用逻辑耦合。 | 为三个业务分别增加 Prompt Builder 和系统 Prompt 常量，Service 通过业务专属 Builder 构造请求。 |

## 涉及文件

- Create: `src/capabilities/text/textPrompts.ts` — 管理文本整理和直接回答 Prompt。
- Create: `src/capabilities/text/textPrompts.test.ts` — 验证文本业务 Prompt 约束。
- Create: `src/capabilities/translation/translationPrompts.ts` — 管理翻译 Prompt、目标语言、源语言和附加指令。
- Create: `src/capabilities/translation/translationPrompts.test.ts` — 验证翻译 Prompt 约束。
- Create: `src/capabilities/retrieval/retrievalPrompts.ts` — 管理检索问答 Prompt 和来源格式化。
- Create: `src/capabilities/retrieval/retrievalPrompts.test.ts` — 验证检索来源和引用规则。
- Modify: `src/capabilities/text/TextTransformationService.ts` — 使用文本 Prompt Builder。
- Modify: `src/capabilities/translation/TranslationService.ts` — 使用翻译 Prompt Builder。
- Modify: `src/capabilities/retrieval/RetrievalService.ts` — 使用检索 Prompt Builder。

## 核心改动

- 三个业务分别管理自己的 Prompt，不再共享业务字符串。
- 保持原有系统 Prompt、用户 Prompt、模型参数和 Provider 调用行为不变。
- Prompt 仍放在 `capabilities` 层，未引入远程配置或复杂模板系统。
- 检索 Provider、检索 Flow 和 UI 行为未修改。

## 验证

- 命令: `npx vitest --run --reporter=verbose`
- 结果: 36 个测试文件、105 个测试通过 ✅
- 命令: `npm run build`
- 结果: TypeScript 检查和 Vite 生产构建通过，73 个模块转换完成 ✅
- 命令: `cargo check --manifest-path src-tauri/Cargo.toml`
- 结果: Rust `dev` profile 检查通过 ✅
