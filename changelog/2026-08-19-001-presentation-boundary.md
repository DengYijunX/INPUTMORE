# 变更记录 #001 — 2026-08-19

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| refactor | 🟡 中 | `App.tsx` 同时承载业务流程和完整浮窗 JSX，后续翻译、检索等功能会集中修改同一文件。 | 新增独立的浮窗展示组件，由 `App.tsx` 负责状态和流程连接，Presentation 负责渲染与用户事件转发。 |

## 涉及文件

- Create: `src/presentation/InputMoreWindow.tsx` — 承载当前浮窗页面 JSX、输入面板和检索/预览结果展示。
- Modify: `src/App.tsx` — 移除浮窗 JSX，改为向 `InputMoreWindow` 传递状态和回调。
- Create: `AGENTS.md` — 增加项目级分层、并行开发和验证规范。

## 核心改动

- 新增 `InputMoreWindow`：集中管理浮窗 Presentation 结构，不直接承担业务流程。
- `App.tsx` 保留现有录音、文本整理、检索和写回编排，暂不改变行为。
- 保留旧版 `FloatingWindow` 和其测试接口，避免本次结构整理扩大回归范围。
- 把文本输入变更和提交事件通过回调传入展示组件，后续可继续将流程迁移到 `application/*Flow.ts`。

## 验证

- 命令: `npx tsc --noEmit`
- 结果: 通过 ✅
- 命令: `cargo check --manifest-path src-tauri/Cargo.toml`
- 结果: 通过 ✅
- 命令: `npx vitest --run --reporter=dot`
- 结果: 29 个测试文件、86 个测试通过 ✅
- 命令: `npm run build`
- 结果: Vite 生产构建通过，65 个模块转换完成 ✅
