# 变更记录 #002 — 2026-08-19

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| refactor, test | 🟡 中 | 检索流程和具体 Search/LLM Provider 组装位于 `App.tsx`，无法独立并行修改和验证。 | 新增检索 Application Flow，并将 Provider、配置和适配器组装集中到基础设施组合模块。 |

## 涉及文件

- Create: `src/application/retrievalFlow.ts` — 定义检索请求校验、调用和取消信号转发边界。
- Create: `src/application/retrievalFlow.test.ts` — 测试查询规范化、取消转发和空查询拒绝。
- Create: `src/infrastructure/composition/createRetrievalService.ts` — 集中创建已配置的搜索和 LLM 服务。
- Modify: `src/App.tsx` — 使用检索 Flow，不再直接组装智谱搜索 Provider。

## 核心改动

- `App.tsx` 只负责检索状态更新、请求版本和错误展示。
- `runRetrievalFlow` 负责检索输入规范化，并通过抽象 `RetrievalRunner` 调用检索能力。
- `createConfiguredRetrievalService` 负责读取配置、校验配置和组合 `ZhipuWebSearch`、`OpenAICompatibleLlm`。
- 保持原有检索行为、错误文案和取消逻辑不变。

## 验证

- 命令: `npx tsc --noEmit`
- 结果: 通过 ✅
- 命令: `npx vitest --run src/application/retrievalFlow.test.ts src/capabilities/retrieval --reporter=dot`
- 结果: 3 个测试文件、8 个测试通过 ✅
- 命令: `npx vitest --run --reporter=dot`
- 结果: 30 个测试文件、89 个测试通过 ✅
- 命令: `npm run build`
- 结果: Vite 生产构建通过，67 个模块转换完成 ✅
- 命令: `cargo check --manifest-path src-tauri/Cargo.toml`
- 结果: 通过 ✅
