# 变更记录 #016 — 2026-08-13

## 概要

| 标签 | 等级 | 根因 | 方案 |
|---|---|---|---|
| bugfix, feature, interaction | 🔴 高 | 浮窗拖动事件覆盖按钮点击，异步任务没有统一取消控制，设置内容与高频浮窗职责混在一起 | 过滤交互控件的拖动启动，增加 AbortController 取消链路，并用独立 Tauri settings 窗口承载配置 |

## 涉及文件

- Create: `src/SettingsPage.tsx` — 独立设置窗口页面
- Modify: `src/App.tsx` — 打开设置窗口、取消任务和转写中止信号
- Modify: `src/presentation/windowDrag.ts` — 交互控件不触发窗口拖动
- Modify: `src/presentation/windowDrag.test.ts` — 按钮点击回归测试
- Modify: `src/App.css` — 设置主窗口样式
- Modify: `src-tauri/capabilities/default.json` — 允许 settings 窗口及创建 WebviewWindow

## 核心改动

- 设置按钮现在通过 `WebviewWindow` 打开独立的 `settings` 窗口；重复点击会聚焦已存在窗口。
- 浮窗上的按钮、输入框、下拉框不再触发拖动。
- 取消会 abort 当前转写、清理录音捕获并回到 `idle`，下一次快捷键可重新开始。
- 设置页面不再嵌入浮窗，浮窗恢复为即时状态提示器。

## 验证

- 命令: `npm run build`
- 结果: 通过 ✅
- 命令: `npm test -- --run --reporter=dot`
- 结果: 12 个测试文件、32 个测试全部通过 ✅
- 命令: `npm run tauri build -- --debug`
- 结果: Rust 已编译到链接阶段；因正在运行的 `inputmore.exe` 被 Windows 锁定，无法覆盖旧文件 ⚠️
