# 变更记录 #023 — 2026-08-13

## 概要

| 标签 | 等级 | 根因 | 方案 |
|---|---|---|---|
| bugfix, provider, config | 🟡 中 | Workspace ID 被单独保存，但 Qwen3-ASR 请求仍使用 `{WorkspaceId}` 占位符 | Provider 调用前将 Workspace ID 注入 base URL，并校验空值与残留占位符 |

## 涉及文件

- Modify: `src/infrastructure/providers/asr/Qwen3Asr.ts` — 解析 Workspace URL
- Modify: `src/infrastructure/providers/asr/Qwen3Asr.test.ts` — 增加真实 URL 解析回归测试

## 核心改动

- 支持 `workspaceId + {WorkspaceId}` 配置方式。
- 请求实际发送到 `https://{workspaceId}.cn-beijing.maas.aliyuncs.com/...`。
- 空 Workspace ID、残留占位符或非法地址仍会明确报错。

## 验证

- 命令: `npm test -- --run --reporter=dot`
- 结果: 16 个测试文件、42 个测试全部通过 ✅
- 命令: `npm run build`
- 结果: Vite production build 通过 ✅
