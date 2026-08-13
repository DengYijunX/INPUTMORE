# 变更记录 #014 — 2026-08-13

## 概要

| 标签 | 等级 | 根因 | 方案 |
|---|---|---|---|
| feature, provider, config | 🟡 中 | 当前只有抽象接口和占位流程，尚未提供可直接选择的 Provider 配置 | 增加 DeepSeek、OpenAI-compatible、Groq Whisper、OpenAI Transcribe 预设，保持 Provider 可替换 |

## 涉及文件

- Create: `src/infrastructure/providers/providerPresets.ts` — Provider 预设及查询函数
- Create: `src/infrastructure/providers/providerPresets.test.ts` — 预设配置回归测试

## 核心改动

- 增加 DeepSeek 文本优化预设，默认使用 `https://api.deepseek.com`。
- 增加 Groq Whisper 与 OpenAI Transcribe ASR 预设，复用现有 OpenAI-compatible ASR 适配器。
- 没有在仓库或代码中写入任何 API Key。
- 阿里云 Paraformer 暂不直接接入当前 Blob 流程；其官方文件转写需要可访问文件 URL，实时方案则是 WebSocket，后续单独实现。

## 验证

- 命令: `npm test -- --run --reporter=dot`
- 结果: 11 个测试文件、29 个测试全部通过 ✅
