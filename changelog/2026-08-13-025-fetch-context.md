# 变更记录 #025 — 2026-08-13

## 概要

| 标签 | 等级 | 根因 | 方案 |
|---|---|---|---|
| bugfix, provider | 🟡 中 | 浏览器原生 `fetch` 被作为脱离 `Window` 上下文的函数调用，触发 `Illegal invocation` | 默认 Provider fetcher 统一绑定 `globalThis`，自定义 fetcher 保持原样 |

## 涉及文件

- Modify: `src/infrastructure/providers/asr/Qwen3Asr.ts` — 绑定默认 fetch 上下文
- Modify: `src/infrastructure/providers/llm/OpenAICompatibleLlm.ts` — 绑定默认 fetch 上下文
- Modify: `src/infrastructure/providers/asr/Qwen3Asr.test.ts` — 增加无自定义 fetcher 的回归测试

## 验证

- 命令: `npm test -- --run --reporter=dot`
- 结果: 16 个测试文件、44 个测试全部通过 ✅
- 命令: `npm run build`
- 结果: Vite production build 通过 ✅
