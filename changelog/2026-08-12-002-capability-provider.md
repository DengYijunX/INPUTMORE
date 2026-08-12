# 变更记录 #002 — 2026-08-12

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, refactor | 🟡 中 | 文本能力需要支持统一模型接口并隔离具体厂商 | 以 `LlmProvider` 为端口，用 `TextTransformationService` 编排三类 Action，以 OpenAI-compatible 适配器实现外部调用 |

## 涉及文件

- Create: `src/capabilities/text/TextTransformer.ts`
- Create: `src/capabilities/text/TextTransformationService.ts`
- Create: `src/infrastructure/providers/llm/LlmProvider.ts`
- Create: `src/infrastructure/providers/llm/OpenAICompatibleLlm.ts`
- Test: 对应 capability 与 Provider 测试文件

## 核心改动

- `TextTransformationService` 统一处理 `enhance / translate / ask`，固定使用单一活动模型。
- 优化转写 Prompt 明确保留事实、原意与语气，只做轻度整理。
- 翻译要求目标语言，Ask 使用直接回答 Prompt，不混入默认优化逻辑。
- `OpenAICompatibleLlm` 负责请求格式、认证、响应解析和错误归一化。

## 验证

- 命令: `npm test -- --run src/capabilities/text/TextTransformationService.test.ts src/infrastructure/providers/llm/OpenAICompatibleLlm.test.ts`
- 结果: 6 个测试通过 ✅
- 命令: `npm run build`
- 结果: TypeScript 检查与 Vite 生产构建通过 ✅
