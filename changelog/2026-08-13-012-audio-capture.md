# 变更记录 #012 — 2026-08-13

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature | 🟡 中 | 快捷键流程没有真实音频输入，停止录音后无法进入可转录的数据流 | 增加独立 AudioCapture 适配器，管理麦克风权限、MediaRecorder 生命周期和资源释放 |

## 涉及文件

- Create: `src/infrastructure/audio/audioCapture.ts`
- Test: `src/infrastructure/audio/audioCapture.test.ts`
- Modify: `src/App.tsx`

## 核心改动

- 第一次有效快捷键调用 `getUserMedia({ audio: true })` 并开始 MediaRecorder。
- 第二次有效快捷键停止录音并生成 Blob。
- 所有终止路径释放 MediaStream tracks，避免麦克风持续占用。
- 权限拒绝、设备不可用、空音频和录音失败归一化为稳定错误。
- 录音适配器不依赖具体 ASR 或 Provider，后续可替换转录实现。

## 验证

- 命令: `npm test -- --run`
- 结果: 8 个测试文件、23 个测试全部通过 ✅
- 命令: `npm run build`
- 结果: TypeScript 检查与 Vite 生产构建通过 ✅
