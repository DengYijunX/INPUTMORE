# 变更记录 #024 — 2026-08-13

## 概要

| 标签 | 等级 | 根因 | 方案 |
|---|---|---|---|
| feature, provider, interaction | 🟡 中 | ASR 已返回文本，但录音完成后没有调用 LLM，仍显示旧的“文本处理尚未接入”占位状态 | 增加 LLM 配置、调用文本整理服务，并进入整理结果预览状态 |

## 涉及文件

- Modify: `src/infrastructure/config/providerConfig.ts` — 增加 LLM 配置存储
- Modify: `src/infrastructure/config/providerConfig.test.ts` — 增加 LLM 配置测试
- Modify: `src/SettingsPage.tsx` — 增加 DeepSeek / OpenAI-compatible 文本模型配置
- Modify: `src/App.tsx` — ASR 结果接入 TextTransformationService
- Modify: `src/domain/actions.ts` — 增加 `previewing` 状态
- Modify: `src/state/sessionMachine.ts` — 补齐新状态分支
- Modify: `src/presentation/StatusView.tsx` — 支持结果预览
- Modify: `src/App.css` — 结果预览样式

## 核心改动

- 录音 → Qwen3-ASR → DeepSeek 文本整理现在形成完整调用链。
- LLM 未配置时给出明确提示，不再显示“尚未接入”的旧文案。
- 文本整理成功后显示预览，并明确提示当前版本尚未写回输入框。
- 支持取消正在进行的 LLM 请求。

## 验证

- 命令: `npm test -- --run --reporter=dot`
- 结果: 16 个测试文件、43 个测试全部通过 ✅
- 命令: `npm run build`
- 结果: Vite production build 通过 ✅
