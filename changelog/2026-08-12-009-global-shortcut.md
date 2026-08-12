# 变更记录 #009 — 2026-08-12

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, dependency | 🟡 中 | 浮窗还没有系统级唤起入口 | 接入 Tauri global-shortcut 插件，以 `Ctrl+Shift+Space` 驱动状态机 |

## 涉及文件

- Create: `src/application/shortcutEvents.ts`
- Test: `src/application/shortcutEvents.test.ts`
- Modify: `src/App.tsx`, `src/App.test.tsx`
- Modify: `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock`, `src-tauri/src/lib.rs`

## 核心改动

- 注册默认全局快捷键 `Ctrl+Shift+Space`。
- Rust 层发送 `inputmore://shortcut` 事件。
- React 层监听按下事件并通过纯状态机切换至录音状态。
- 暂未实现音频采集；释放与转录将在音频能力接入时完成。

## 验证

- 命令: `npm test -- --run`
- 结果: 7 个测试文件、19 个测试全部通过 ✅
- 命令: `npm run build`
- 结果: 前端生产构建通过 ✅
- 命令: `cargo check --manifest-path src-tauri/Cargo.toml`
- 结果: Tauri 编译检查通过 ✅
