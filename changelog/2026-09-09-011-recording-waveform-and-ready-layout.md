# 变更记录 #011 — 2026-09-09

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, feature, refactor | 🟡 中 | 初始态能力入口挤压 READY 导致文案省略，录音波形只有静态高度没有声音反馈 | 固定 READY 不收缩并恢复图 3 的圆形竖排入口；为录音波形增加分柱动画和减弱动效支持 |

## 涉及文件

- Modify: `src/presentation/InputMoreWindow.tsx` — 为录音波形增加专属 test id/class，保留 REC 状态。
- Modify: `src/App.css` — 将能力入口改为圆形竖排布局，固定状态文字，增加录音波形动画。
- Modify: `src/presentation/InputMoreWindow.test.tsx` — 增加录音态声音纹和 REC 状态测试。
- Modify: `docs/superpowers/specs/2026-09-09-floating-overlay-ux-design.md` — 补充图 3 初始态和录音态定义。
- Modify: `docs/superpowers/plans/2026-09-09-floating-overlay-ux.md` — 同步实现计划边界。

## 核心改动

- 初始态完整显示 `READY`，不再出现 `REA...`。
- 文本、翻译、检索入口恢复为圆形按钮，图标在上、中文标签在下。
- 录音态显示动态声音纹，七根波形柱使用错开时序产生声音动态效果。
- `prefers-reduced-motion: reduce` 时停用波形动画，但保留静态声音纹。
- 未改变 rawWrite、enhance、translate、ask 和检索流程。

## 验证

- 命令：`npx vitest --run src/presentation/InputMoreWindow.test.tsx --reporter=dot`
  - 结果：2 个测试文件相关测试 10 个通过 ✅
- 命令：`npx vitest --run --reporter=dot`
  - 结果：39 个测试文件、120 个测试通过 ✅
- 命令：`npm run build`
  - 结果：TypeScript 检查和 Vite 生产构建通过 ✅
- 命令：`cargo check --manifest-path src-tauri/Cargo.toml`
  - 结果：Rust 检查通过 ✅
- 桌面端 CDP：
  - 空闲态文本为 `READY`、`文本`、`翻译`、`检索` 和 `⚙`；
  - `InputMore` 和音符均未渲染；
  - 空闲态浮窗尺寸约 360×60，未观察到横向溢出；
  - 翻译输入态尺寸约 360×215，文本/检索输入态约 360×172；
  - 取消可恢复空闲态。
