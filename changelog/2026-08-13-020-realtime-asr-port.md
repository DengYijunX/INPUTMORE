# 变更记录 #020 — 2026-08-13

## 概要

| 标签 | 等级 | 根因 | 方案 |
|---|---|---|---|
| feature, architecture, provider | 🟡 中 | 现有录音服务只在停止时生成 Blob，无法承载 Paraformer 的持续音频流和明确的结束 / 取消生命周期 | 增加音频块回调，并抽取独立的实时转写会话端口 |

## 涉及文件

- Modify: `src/infrastructure/audio/audioCapture.ts` — 增加可选 `onChunk` 回调
- Modify: `src/infrastructure/audio/audioCapture.test.ts` — 验证录音期间输出非空音频块
- Create: `src/capabilities/transcription/RealtimeTranscriptionSession.ts` — 流式会话生命周期
- Create: `src/capabilities/transcription/RealtimeTranscriptionSession.test.ts` — 验证 start / push / finish / cancel

## 核心改动

- 录音过程中可持续获得音频块，同时保留原有最终 Blob。
- 实时转写会话只返回最终文本，不把中间识别结果带到输入框。
- 明确取消后禁止继续发送音频块。
- 为后续 Tauri 原生 WebSocket 实现保留稳定端口。

## 验证

- 命令: `npm run build`
- 结果: Vite production build 通过 ✅
- 命令: `npm test -- --run --reporter=dot`
- 结果: 15 个测试文件、38 个测试全部通过 ✅
