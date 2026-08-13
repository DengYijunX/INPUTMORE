# 变更记录 #013 — 2026-08-13

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, bugfix | 🟡 中 | 录音停止后没有 ASR 调用或失败出口，界面永久停留在“正在识别” | 增加 Transcriber 端口、OpenAI-compatible ASR 适配器和明确的未配置错误状态 |

## 涉及文件

- Create: `src/capabilities/transcription/Transcriber.ts`
- Create: `src/capabilities/transcription/TranscriptionService.ts`
- Create: `src/infrastructure/providers/asr/OpenAICompatibleAsr.ts`
- Test: 对应转录服务与 ASR Provider 测试
- Modify: `src/App.tsx`

## 核心改动

- 录音停止后将 Blob 交给 Transcriber。
- ASR 成功进入后续文本处理，失败进入可恢复错误状态。
- 未配置 ASR 时显示“转录服务未配置”，不再无限等待。

## 验证结果

- 命令: `npm test -- --run`
- 结果: 10 个测试文件、27 个测试全部通过 ✅
- 命令: `npm run build`
- 结果: TypeScript 检查与 Vite 生产构建通过 ✅
