# 变更记录：右侧 Alt 按下切换录音

- 日期：2026-08-14
- 类型：fix

## 问题

原快捷键为 `Ctrl+Shift+Space`，并且依赖按下/松开事件结束录音。用户松键稍慢时，容易被误判为第二次操作，导致快捷键交互不稳定。

## 处理

- 全局快捷键改为右侧 `Alt`（`AltRight`）。
- 第一次按下进入录音，第二次按下结束录音。
- 松开事件不再改变会话状态。
- 前端显示的默认快捷键同步为 `Right Alt`。

## 验证

- `npm test -- --run`
- `npm run build`
- `cargo check --manifest-path src-tauri/Cargo.toml`
