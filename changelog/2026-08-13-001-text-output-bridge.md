# 变更记录 #001 — 2026-08-13

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, dependency, security, docs | 🔴 高 | 整理结果只停留在浮窗预览，没有可靠写入用户原输入位置的系统级输出通道 | 增加 `TextOutputPort`，Windows 通过前台窗口、临时剪贴板和模拟粘贴完成写回，并保留复制兜底 |

## 涉及文件

- `src/capabilities/output/TextOutputPort.ts` — 定义输出端口和稳定结果类型。
- `src/infrastructure/output/TauriTextOutput.ts` — 实现剪贴板保存/恢复和 Tauri 命令桥接。
- `src-tauri/src/output.rs` — 实现 Windows 前台窗口、焦点恢复和 `SendInput` 粘贴命令。
- `src/App.tsx` — 将整理结果接入自动写回流程。
- `src/state/sessionMachine.ts` — 允许写回和答案展示状态取消。
- `package.json`、`src-tauri/Cargo.toml`、权限文件 — 接入 Tauri clipboard-manager 及相关权限。
- `docs/superpowers/specs/2026-08-13-text-output-bridge-design.md` — 记录设计边界。

## 核心改动

- 新增 `TextOutputPort`：上层业务不直接依赖 Windows API 或剪贴板实现。
- 新增 `createTauriTextOutput()`：调用官方 Tauri 剪贴板插件和 Rust 原生命令。
- 新增 Windows 输出命令：捕获目标窗口、恢复焦点、发送 `Ctrl+V`。
- 修改 `App`：第一次快捷键捕获目标窗口，整理完成后进入 `writingBack` 并自动写回；失败时提供复制结果。
- 修改取消逻辑：取消后通过会话版本号阻止异步流程继续粘贴。

## 验证

- `npm test -- --run`：18 个测试文件、48 个测试通过。
- `npm run build`：通过。
- `cargo check --manifest-path src-tauri/Cargo.toml`：通过。
- `git diff --check`：通过。
- Tauri 开发版：已成功编译并启动，实际窗口可见。
- 跨应用光标插入/选区替换：尚未完成，桌面自动化在恢复浏览器测试窗口时被安全策略中止，未将其标记为通过。
