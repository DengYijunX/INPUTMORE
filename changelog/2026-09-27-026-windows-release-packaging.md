# 变更记录 #026 — 2026-09-27

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, config, docs | 🟡 中 | Tauri bundle 未启用，项目无法生成可分发的 Windows 安装包 | 开启 NSIS 打包、复用现有图标并补充发布构建说明 |

## 涉及文件

- Modify: `src-tauri/tauri.conf.json` — 启用 NSIS Windows 安装包和现有图标
- Modify: `docs/getting-started.md` — 增加发布构建命令和产物路径
- Modify: `README.md` — 增加英文版本地安装包构建说明
- Modify: `README.zh-CN.md` — 增加中文版本地安装包构建说明
- Create: `docs/superpowers/plans/2026-09-27-windows-release-packaging.md` — 保存实施计划

## 核心改动

- 开启 `bundle.active`，目标限定为 `nsis`。
- 使用 `32x32.png`、`128x128.png`、`128x128@2x.png` 和 `icon.ico` 作为安装包图标来源。
- 保持版本号为 `0.1.0`，不改变运行时功能和 Provider 配置行为。
- 记录构建命令：`npm run tauri build`。

## 验证

- 命令：`npm run build`
  - 结果：Vite 生产构建通过，76 个模块完成转换 ✅
- 命令：`cargo check --manifest-path src-tauri/Cargo.toml`
  - 结果：Rust 检查通过 ✅
- 命令：`npm run tauri build`
  - 结果：清除失效代理环境变量后成功生成 NSIS 安装包 ✅
- 产物：`src-tauri/target/release/bundle/nsis/InputMore_0.1.0_x64-setup.exe`
- 备注：第一次打包失败是因为本机代理 `127.0.0.1:7890` 连接被拒绝；绕过该代理后 GitHub 工具包下载和 hash 校验均通过。
