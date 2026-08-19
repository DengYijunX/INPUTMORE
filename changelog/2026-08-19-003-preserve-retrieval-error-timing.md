# 变更记录 #003 — 2026-08-19

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| refactor, bugfix | 🟢 低 | 检索 Provider 组装迁移后，缺少配置时会先进入处理中状态。 | 在进入处理中前完成配置预检查，恢复重构前的错误分支时序。 |

## 涉及文件

- Modify: `src/infrastructure/composition/createRetrievalService.ts` — 返回配置结果，不再通过异常表示缺少配置。
- Modify: `src/App.tsx` — 在创建 session 和进入 processing 前处理配置错误。

## 核心改动

- `createConfiguredRetrievalService()` 返回 `{ ok: true, service }` 或 `{ ok: false, message }`。
- 检索配置缺失时直接进入 `error`，不再短暂显示 `processing`。
- 正常检索、取消、错误和结果展示流程保持不变。

## 验证

- 命令: `npx tsc --noEmit`
- 结果: 通过 ✅
- 命令: `npx vitest --run --reporter=dot`
- 结果: 30 个测试文件、89 个测试通过 ✅
- 命令: `npm run build`
- 结果: Vite 生产构建通过，67 个模块转换完成 ✅
