# 变更记录 #020 — 2026-09-10

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, refactor | 🟡 中 | 预览展开后的实际文档高度没有稳定参与 Tauri 窗口高度计算，导致底部内容被裁切 | 提取窗口高度计算纯函数，取卡片布局高度和文档内容高度的较大值，并保留最小窗口高度 |

## 涉及文件

- Create: `src/presentation/windowResize.ts` — 计算浮窗最终高度的纯函数。
- Create: `src/presentation/windowResize.test.ts` — 覆盖最小高度、文档高度和卡片高度边界。
- Modify: `src/App.tsx` — 使用卡片布局高度和文档滚动高度共同计算 Tauri 窗口高度。

## 核心改动

- 预览内容展开时，文档实际高度会参与窗口 resize；
- 卡片高度较大时仍保留原有 20px 窗口边距；
- 空闲态继续保持最小窗口高度 90px；
- 不改变预览内容、复制、展开/收起和 Provider 行为。

## 验证

- 命令：`npx vitest --run --reporter=dot`
  - 结果：40 个测试文件、124 个测试通过 ✅
- 命令：`npm run build`
  - 结果：TypeScript 检查和 Vite 生产构建通过 ✅
- 命令：`cargo check --manifest-path src-tauri/Cargo.toml`
  - 结果：Rust 检查通过 ✅
