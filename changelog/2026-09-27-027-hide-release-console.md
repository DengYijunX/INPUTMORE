# 变更记录 #027 — 2026-09-27

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, config | 🟡 中 | Windows release 入口未声明 GUI 子系统，安装版启动时显示控制台窗口 | 为非 debug 构建启用 `windows_subsystem = "windows"` |

## 涉及文件

- Modify: `src-tauri/src/main.rs` — 隐藏 release 构建的控制台窗口
- Modify: `docs/superpowers/plans/2026-09-27-windows-release-packaging.md` — 记录后续修复

## 核心改动

- 新增 `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]`。
- 开发模式仍保留终端日志，方便调试；安装版不再依赖终端窗口维持运行。

## 验证

- 命令：`npm run tauri build`
  - 结果：成功生成 `InputMore_0.1.0_x64-setup.exe` ✅
- PE 检查：`src-tauri/target/release/inputmore.exe`
  - 结果：`subsystem=2 (Windows GUI)` ✅
