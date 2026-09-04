# 变更记录 #006 — 2026-09-04

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feat, refactor, test, docs | 🟡 中 | 翻译入口缺少稳定的目标语言配置，设置页与浮窗之间没有清晰的配置边界。 | 增加独立的翻译目标语言配置存储、设置页管理和浮窗快速选择；翻译流程继续负责最终校验与预览。 |

## 涉及文件

- Create: `src/infrastructure/config/translationConfig.ts` — 管理最多 3 个常用目标语言和默认语言。
- Create: `src/infrastructure/config/translationConfig.test.ts` — 覆盖配置读写、校验、去重和损坏数据恢复。
- Create: `src/SettingsPage.test.tsx` — 覆盖目标语言设置、添加、删除、默认语言和保存反馈。
- Create: `src/presentation/InputMoreWindow.test.tsx` — 覆盖翻译目标语言选择回调。
- Modify: `src/SettingsPage.tsx` — 增加翻译目标语言设置区域。
- Modify: `src/App.tsx` — 读取最新配置并传递翻译任务的临时目标语言。
- Modify: `src/presentation/InputMoreWindow.tsx` — 增加翻译目标语言下拉选择和预览提示。
- Modify: `src/App.css` — 增加目标语言配置和选择器样式。

## 核心改动

- 配置使用独立 key `inputmore.translation.config`，UI 不直接操作 `localStorage`。
- 常用目标语言最多保存 3 个，默认语言必须来自已保存列表，不能删除最后一个语言。
- 设置页保存后，下一次打开翻译浮窗时读取最新配置；翻译任务内仍可临时切换目标语言。
- 翻译结果保持浮窗预览，不自动写回；翻译 Service、Flow、Prompt 和 LlmProvider 抽象边界不变。
- 未修改 rawWrite、enhance、ask 和检索 Provider 流程。

## 验证

- 命令: `npx vitest --run --reporter=dot`
- 结果: 39 个测试文件、113 个测试通过 ✅
- 命令: `npm run build`
- 结果: TypeScript 检查和 Vite 生产构建通过，74 个模块转换完成 ✅
- 命令: `cargo check --manifest-path src-tauri/Cargo.toml`
- 结果: Rust `dev` profile 检查通过 ✅
