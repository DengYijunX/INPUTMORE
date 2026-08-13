# 变更记录 #019 — 2026-08-13

## 概要

| 标签 | 等级 | 根因 | 方案 |
|---|---|---|---|
| feature, provider, config | 🟡 中 | 阿里云 Paraformer 需要北京地域 Workspace ID，现有配置模型无法表达该参数 | 增加 Paraformer Provider 预设及 Workspace ID 配置字段 |

## 涉及文件

- Modify: `src/infrastructure/providers/providerPresets.ts` — 增加阿里云 Paraformer 预设
- Modify: `src/infrastructure/providers/providerPresets.test.ts` — 增加 Workspace ID 断言
- Modify: `src/infrastructure/config/providerConfig.ts` — 支持 Workspace ID
- Modify: `src/infrastructure/config/providerConfig.test.ts` — 覆盖新字段
- Modify: `src/SettingsPage.tsx` — 增加阿里云选项和 Workspace ID 输入

## 核心改动

- 默认 ASR Provider 改为阿里云 Paraformer。
- 默认模型为 `paraformer-realtime-v2`。
- 设置页可填写 API Key、Workspace ID、模型和 WebSocket 地址。
- 保留 Groq Whisper 与 OpenAI Transcribe 作为备用选项。

## 验证

- 命令: `npm test -- --run --reporter=dot`
- 结果: 14 个测试文件、35 个测试全部通过 ✅
- 命令: `npm run build`
- 结果: Vite production build 通过 ✅
