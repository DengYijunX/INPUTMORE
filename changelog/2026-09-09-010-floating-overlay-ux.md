# 变更记录 #010 — 2026-09-09

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, refactor, bugfix | 🟡 中 | 主浮窗各状态复用了不统一的尺寸与装饰元素，入口按钮语义和内容区溢出约束不足 | 在 presentation 层引入图标文字入口、原有暖色系提亮反馈和统一内容边界，不修改业务流程与 Provider |

## 涉及文件

- Create: `src/presentation/CapabilityIcon.tsx` — 提供文本、翻译、检索三种纯展示 SVG 图标。
- Modify: `src/presentation/InputMoreWindow.tsx` — 去掉音符和 `InputMore`，替换为图标文字入口，并补充 hover/focus 交互标记。
- Modify: `src/App.css` — 增加入口按钮样式、原有暖灰色系提亮反馈和内容区溢出约束。
- Modify: `src/App.test.tsx` — 更新初始态断言。
- Modify: `src/presentation/InputMoreWindow.test.tsx` — 增加图标、hover/focus、空输入、长预览和错误态测试。

## 核心改动

- 删除初始态的音符和 `InputMore` 文案，左侧直接显示 `READY`。
- 新增 `CapabilityIcon`，使用文本、语言转换和放大镜图标表达三个功能入口。
- 功能按钮统一为图标 + 中文标签，悬停和键盘焦点使用原有暖灰/深棕色系提亮，不引入蓝灰色。
- 浮窗和内容面板增加最大宽度、滚动和换行约束，长内容不会产生横向溢出。
- 保留翻译目标语言选择、预览行为以及 rawWrite、enhance、ask 和检索流程。

## 验证

- 命令：`npx vitest --run src/App.test.tsx src/presentation/InputMoreWindow.test.tsx --reporter=dot`
  - 结果：2 个测试文件、6 个测试通过 ✅
- 命令：`npx vitest --run --reporter=dot`
  - 结果：39 个测试文件、119 个测试通过 ✅
- 命令：`npm run build`
  - 结果：TypeScript 检查和 Vite 生产构建通过 ✅
- 命令：`cargo check --manifest-path src-tauri/Cargo.toml`
  - 结果：Rust 检查通过 ✅
- 桌面端 CDP：
  - 空闲态显示 `READY`、文本/翻译/检索图标文字入口和设置按钮；
  - 翻译空输入提交禁用，输入后启用；
  - 翻译面板尺寸约 360×215，文本/检索输入面板约 360×172；
  - 取消可恢复空闲态，未观察到横向溢出；
  - 首次读取曾遇到 WebView React 挂载时序导致空 DOM，等待挂载后复测正常。
