# 变更记录 #008 — 2026-08-14

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, config | 🔴 高 | 当前 Tauri 全局热键库不支持将单独的 `Code::AltRight` 转换为 Windows VKCode | 使用 Windows 低级键盘钩子监听 `VK_RMENU`，向现有前端发送统一的快捷键事件 |

## 涉及文件

- Modify: `src-tauri/src/lib.rs` — 移除不可用的 `Code::AltRight` 全局热键注册，改为安装右 Alt 监听器。
- Create: `src-tauri/src/shortcut.rs` — 添加 Windows 右 Alt 键盘钩子及事件映射。
- Create: `changelog/2026-08-14-008-right-alt-startup-crash.md` — 记录根因、方案和验证结果。

## 核心改动

- 监听 Windows `VK_RMENU`，区分 `WM_SYSKEYDOWN` / `WM_SYSKEYUP`。
- 仅右 Alt 触发事件，左 Alt 和其他按键忽略。
- 保留现有 `pressed` / `released` 事件格式，前端按下切换逻辑无需修改。
- 避免应用在 Tauri setup 阶段因 `Unknown VKCode for AltRight` 崩溃。

## 验证

- `cargo test --manifest-path src-tauri/Cargo.toml shortcut::tests::maps_only_right_alt_key_events`：通过。
- `npm test -- --run`：19 个测试文件、54 个测试通过。
- `npm run build`：通过。
- `cargo check --manifest-path src-tauri/Cargo.toml`：通过。
- `npm run tauri dev`：成功启动，未再出现 setup panic；随后关闭验证进程。
