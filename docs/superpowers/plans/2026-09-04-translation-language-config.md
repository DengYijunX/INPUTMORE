# Translation Language Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为翻译提供最多 3 个常用目标语言、可持久化默认语言和浮窗快速选择，同时保持现有翻译及其他 Action 行为不变。

**Architecture:** `infrastructure/config/translationConfig.ts` 负责 localStorage 和配置校验；SettingsPage 通过配置 API 管理语言；App 在翻译输入时读取默认语言，InputMoreWindow 仅通过 props 展示和修改当前选择。翻译 Flow 和 Service 继续作为最终校验边界。

**Tech Stack:** React 19、TypeScript、Vitest、Vite、Tauri 2。

---

### Task 1: Translation configuration storage

**Files:**
- Create: `src/infrastructure/config/translationConfig.test.ts`
- Create: `src/infrastructure/config/translationConfig.ts`

- [x] 写失败测试：默认配置、保存读取、最多 3 个语言、删除最后一个保护、默认语言合法性、损坏 JSON 恢复和重复语言去重。
- [x] 实现 `TranslationLanguage`、`TranslationConfig`、默认配置及纯配置操作函数；localStorage key 使用 `inputmore.translation.config`。
- [x] 运行配置测试并确认全部通过。

### Task 2: Settings page language management

**Files:**
- Modify: `src/SettingsPage.tsx`
- Modify: `src/App.test.tsx` or Create: `src/SettingsPage.test.tsx`

- [x] 写失败测试：设置页展示目标语言、添加语言、达到 3 个后禁用添加、设置默认语言、删除语言和保存反馈。
- [x] 增加独立“翻译目标语言”设置卡片，复用配置存储 API，不让组件直接操作 localStorage。
- [x] 保持现有 ASR、LLM 和 Search 配置表单行为不变。

### Task 3: Floating translation selector

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/presentation/InputMoreWindow.tsx`
- Modify: `src/App.test.tsx`

- [x] 写失败测试：点击翻译后显示默认目标语言，切换目标语言后提交使用当前值，空目标语言不能提交。
- [x] App 读取默认配置并管理当前翻译任务的临时选择；取消或任务结束后恢复默认值。
- [x] InputMoreWindow 只负责展示下拉选择和触发回调，不读取配置、不创建 Provider。

### Task 4: Regression verification and record

**Files:**
- Modify: `changelog/2026-09-04-006-translation-language-config.md`

- [x] 运行完整 Vitest、`npm run build` 和 `cargo check --manifest-path src-tauri/Cargo.toml`。
- [x] 检查 rawWrite、enhance、ask 和检索 Provider 未发生非预期变更。
- [x] 更新 changelog 并提交中文 Conventional Commit。
