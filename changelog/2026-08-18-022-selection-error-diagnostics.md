# 变更记录 #022 — 2026-08-18

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, docs | 🟡 中 | 选区读取链路把底层异常统一显示为同一句话，无法区分窗口焦点、复制输入和剪贴板问题 | 将底层错误原因显示在浮窗中，并允许多行展示，便于定位具体边界 |

## 涉及文件

- `src/application/selectionErrors.ts` — 统一格式化选区读取错误
- `src/application/selectionErrors.test.ts` — 覆盖错误详情保留
- `src/App.tsx` — 将底层选区错误传递到界面
- `src/App.css` — 支持错误详情换行展示

## 核心改动

- “读取选中文字失败”现在会附带具体原因。
- 错误信息不再单行截断，便于区分目标窗口、复制输入和剪贴板边界。

## 验证

- `npm test -- --run` — 23 个测试文件、70 个测试全部通过 ✅
- `npm run build` — Vite 生产构建通过 ✅
- `cargo check --manifest-path src-tauri/Cargo.toml` — 通过 ✅
- `git diff --check` — 无差异格式错误 ✅
