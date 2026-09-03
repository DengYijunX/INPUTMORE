# Translation Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `translate` Action 建立独立、可取消、默认预览的翻译垂直流程，同时保持 rawWrite、enhance 和 ask 行为不变。

**Architecture:** 使用抽象 `LlmProvider` 注入独立的 `TranslationService`，由 `translationFlow` 负责输入校验、取消和过期请求保护。Presentation 继续复用浮窗外壳，通过统一 `SessionState` 展示翻译输入和预览结果；检索 Provider 与流程保持不变。

**Tech Stack:** React 19、TypeScript、Vitest、Vite、Tauri 2、Rust。

---

### Task 1: 翻译能力契约与 Service

**Files:**
- Create: `src/capabilities/translation/TranslationService.test.ts`
- Create: `src/capabilities/translation/TranslationService.ts`
- Modify: `src/capabilities/text/TextTransformationService.ts`
- Modify: `src/capabilities/text/TextTransformationService.test.ts`

- [ ] 先写并运行翻译 Service 失败测试：正常翻译、目标语言为空、空输入、Provider 只调用一次、Prompt 约束、取消信号和空响应。
- [ ] 实现最小 `TranslationService`，仅依赖 `LlmProvider`，校验后调用一次 Provider，并返回清理后的翻译文本。
- [ ] 删除 `TextTransformationService` 的 translate 分支和对应旧测试，保留 rawWrite、enhance、ask 行为。

### Task 2: Translation Application Flow

**Files:**
- Create: `src/application/translationFlow.test.ts`
- Create: `src/application/translationFlow.ts`

- [ ] 先写并运行 Flow 失败测试：空输入、缺少目标语言、信号转发、Provider 错误、取消和旧请求结果丢弃。
- [ ] 实现 `runTranslationFlow`，负责标准化输入、目标语言校验、调用 Service，并以请求版本回调保护结果提交。

### Task 3: Domain、状态机和组合根接入

**Files:**
- Modify: `src/domain/actions.ts`
- Modify: `src/state/sessionMachine.ts`
- Modify: `src/state/sessionMachine.test.ts`
- Create: `src/infrastructure/composition/createTranslationService.ts`

- [ ] 增加翻译文本输入和目标语言所需的最小状态边界测试。
- [ ] 修改状态机，使 translate 的 `result_ready` 进入 `previewing`，enhance/rawWrite/ask 保持原有路径。
- [ ] 增加配置检查和 `TranslationService` 组合工厂，不修改检索组合工厂。

### Task 4: Floating UI 接入

**Files:**
- Modify: `src/presentation/InputMoreWindow.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Create if needed: `src/presentation/TranslationInput.tsx`
- Create if needed: `src/presentation/TranslationResult.tsx`

- [ ] 增加翻译入口、目标语言输入和提交回调，UI 不直接实例化 Provider。
- [ ] 将翻译请求接入 Flow，默认显示翻译预览，不调用写回接口。
- [ ] 添加 UI 回归测试，确认原有文本整理和检索入口仍可用。

### Task 5: 回归验证和变更记录

**Files:**
- Modify: `changelog/2026-09-03-004-translation-vertical-slice.md`

- [ ] 运行相关测试和完整 Vitest 测试。
- [ ] 运行 `npm run build`。
- [ ] 运行 `cargo check --manifest-path src-tauri/Cargo.toml`。
- [ ] 核对 git diff，确认检索 Provider 和 retrieval Flow 未被修改。
- [ ] 完成 changelog 记录；仅在用户明确要求时提交 Git。
