# 变更记录 #008 — 2026-09-07

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, config, test | 🟡 中 | 设置窗口复用时调用 `show` 和 `setFocus`，但 Tauri capability 未声明对应权限。 | 为应用窗口 capability 增加最小的显示和聚焦权限，并通过桌面端 CDP 验证首次打开和重复复用。 |

## 涉及文件

- Modify: `src-tauri/capabilities/default.json` — 增加 `core:window:allow-show` 和 `core:window:allow-set-focus`。

## 核心改动

- 保持现有窗口权限范围不变，仅补充设置窗口复用所需的两个权限。
- 未修改前端设置流程、翻译流程和检索业务逻辑。

## 验证

- 命令: `npx vitest --run --reporter=dot`
- 结果: 39 个测试文件、114 个测试通过 ✅
- 命令: `npm run build`
- 结果: TypeScript 检查和 Vite 生产构建通过，74 个模块转换完成 ✅
- 命令: `cargo check --manifest-path src-tauri/Cargo.toml`
- 结果: Rust `dev` profile 检查通过 ✅
- 桌面端 CDP: 设置窗口首次打开和第二次复用均成功，无 `window.show`/`setFocus` 权限异常 ✅
- 桌面端真实检索: 请求已到达智谱 Web Search，但返回 HTTP 429；前端正确显示可理解的错误状态 ✅
