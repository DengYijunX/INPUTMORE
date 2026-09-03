# 变更记录 #004 — 2026-09-03

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, refactor, test, docs | 🟡 中 | 翻译逻辑耦合在 `TextTransformationService`，且没有独立输入、流程和预览边界。 | 抽离 `TranslationService` 与 `translationFlow`，复用 `LlmProvider`，通过统一 SessionState 默认展示翻译预览。 |

## 涉及文件

- Create: `src/capabilities/translation/TranslationService.ts` — 独立翻译能力、Prompt 和输入/结果校验。
- Create: `src/capabilities/translation/TranslationService.test.ts` — 覆盖正常翻译、目标语言、空输入、取消、空响应和 Provider 单次调用。
- Create: `src/application/translationFlow.ts` — 翻译输入标准化、AbortSignal 转发和过期请求保护。
- Create: `src/application/translationFlow.test.ts` — 覆盖 Flow 输入校验、取消、过期结果和 Provider 错误。
- Create: `src/infrastructure/composition/createTranslationService.ts` — 从现有 LLM 配置组装翻译服务。
- Create: `src/infrastructure/composition/createTranslationService.test.ts` — 覆盖配置缺失和正常组装。
- Modify: `src/capabilities/text/TextTransformationService.ts` — 删除翻译分支，保留 rawWrite/enhance/ask 行为。
- Modify: `src/domain/actions.ts` — 允许 translate 进入文本输入状态。
- Modify: `src/state/sessionMachine.ts` — 翻译结果进入 `previewing`，不进入写回。
- Modify: `src/App.tsx` — 接入翻译入口、目标语言和独立 Flow。
- Modify: `src/presentation/InputMoreWindow.tsx` — 增加翻译入口、目标语言输入和翻译预览文案。

## 核心改动

- 新增 `TranslationService`：仅依赖抽象 `LlmProvider`，要求非空目标语言，并要求模型保留原意、语气和格式，只返回翻译结果。
- 新增 `runTranslationFlow`：统一处理输入校验、取消信号和旧请求结果丢弃。
- 翻译结果通过 `SessionState` 进入预览，当前版本不会自动写回输入框。
- 保持 `rawWrite`、`enhance` 和 `ask` 流程行为不变。
- 未修改检索 Provider、`RetrievalService` 或 `retrievalFlow`。

## 验证

- 命令: `npx vitest --run src/capabilities/translation/TranslationService.test.ts ...`
- 结果: 翻译、状态机、组合和 UI 定向测试通过，31 个测试通过 ✅
- 命令: `npx vitest --run --reporter=dot`
- 结果: 33 个测试文件、101 个测试通过 ✅
- 命令: `npm run build`
- 结果: TypeScript 检查和 Vite 生产构建通过，70 个模块转换完成 ✅
- 命令: `cargo check --manifest-path src-tauri/Cargo.toml`
- 结果: Rust `dev` profile 检查通过 ✅
