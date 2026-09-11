# InputMore 产品级开源仓库包装实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 InputMore 包装成一个面向中英文开源用户、可快速理解和下载的轻量桌面输入增强产品仓库。

**Architecture:** 以英文 README 为主入口，中文 README 作为辅助入口；首屏围绕“输入增强”叙事，展示真实语音写回闭环，翻译和检索作为辅助能力。文档、社区文件、CI 和 Release 配置彼此独立，通过 README 链接串联。

**Tech Stack:** Markdown、GitHub Actions、Tauri 2、React、TypeScript、Rust、npm、Cargo。

---

## 文件范围

- Create: `README.md` — 英文主 README，包含首屏、功能、安装、隐私和贡献入口。
- Create: `README.zh-CN.md` — 中文辅助 README，与英文内容保持功能状态一致。
- Create: `LICENSE` — 默认使用 MIT，保证 README、贡献和发布文档的授权表述一致。
- Create: `CONTRIBUTING.md` — 本地开发、测试、提交和 PR 规范。
- Create: `SECURITY.md` — API Key、日志、漏洞报告和安全边界说明。
- Create: `CODE_OF_CONDUCT.md` — 社区行为规范。
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml` — Bug 报告模板。
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml` — 功能建议模板。
- Create: `.github/pull_request_template.md` — PR 检查清单。
- Create: `.github/workflows/ci.yml` — 前端检查、测试、构建和 Rust 检查。
- Create: `docs/getting-started.md` — 首次配置、Provider、权限和快捷键说明。
- Create: `docs/privacy.md` — 数据流和 Provider 隐私边界。
- Create: `docs/architecture.md` — 输入增强处理链路和分层架构。
- Modify: `docs/product-status-and-roadmap.md` — 修正当前功能状态，避免把已接入能力标成未实现。
- Modify: `package.json` — 如有必要增加稳定的验证脚本，但不改变现有运行方式。
- Modify: `src-tauri/tauri.conf.json` — 仅在准备真实 Release 时启用 bundle；不在没有验证安装流程前开启发布承诺。
- Create: `assets/` 下的真实截图、GIF 和社交预览图 — 由实际运行应用录制或截图，不用伪造素材。

## Task 1: 统一产品叙事和功能状态

- [ ] **Step 1: 对照实际代码确认 Available / Planned**

确认 Raw Write、Enhance、Translate、Ask 的实际入口、输出语义、平台限制和 Provider 要求。README 不宣称当前没有实现的 macOS/Linux、离线模型、多轮 Agent 或流式输出。

- [ ] **Step 2: 更新产品状态文档**

修正 `docs/product-status-and-roadmap.md` 中与当前 `src/App.tsx`、`src/presentation/InputMoreWindow.tsx` 和 `src/application/` 不一致的段落，明确翻译和文本检索的实际状态。

- [ ] **Step 3: 验证文案边界**

搜索 `README.md`、`docs/` 和界面文案中的平台及隐私承诺，确保只使用已验证的表述：当前 Windows 优先、Provider 无关、API Key 本机保存、检索结果默认展示而不自动写回。

- [ ] **Step 4: Commit**

```powershell
git add docs/product-status-and-roadmap.md
git commit -m "docs(product): 统一输入增强产品定位"
```

## Task 2: 准备 README 首屏和中英文文档

- [ ] **Step 1: 写英文 README 首屏**

使用以下固定叙事：

```text
InputMore
More power for every input.
The AI input layer for every app.

Voice typing, text rewriting, translation, and occasional web answers
for the apps you already use.
```

首屏必须链接 Download、Quick Start、Documentation、Roadmap，并标注当前版本支持 Windows。

- [ ] **Step 2: 加入真实 GIF 和截图位置**

使用 `assets/hero-voice-writeback.gif` 展示快捷键 → 说话 → 转写 → 当前应用写回；使用 `assets/feature-*.png` 展示文本整理、翻译和检索。素材缺失时保留明确的待准备清单，不嵌入虚构图片。

- [ ] **Step 3: 编写功能矩阵和使用场景**

主次关系固定为：输入增强是主能力，翻译和检索是辅助能力。场景使用“输入 → 结果”格式，避免把产品描述成聊天机器人或输入法。

- [ ] **Step 4: 编写中文 README**

中文文档与英文 README 共享同一功能状态；中文标题使用“桌面 AI 输入增强层”，不把 `InputMore` 翻译成“输入更多”。

- [ ] **Step 5: 添加快速开始和隐私链接**

将安装、Provider 配置、Right Alt、Ctrl + Right Alt、API Key 保存位置和检索不自动写回的规则链接到独立文档。

- [ ] **Step 6: Commit**

```powershell
git add README.md README.zh-CN.md docs/getting-started.md docs/privacy.md
git commit -m "docs(repository): 增加双语产品 README"
```

## Task 3: 增加开源社区基础文件

- [ ] **Step 1: 添加许可证**

默认采用 MIT 许可证创建 `LICENSE`；如果发布者在执行 Task 3 前明确选择其他许可证，则所有 README、贡献指南和 Release 说明统一使用该许可证名称，不出现相互矛盾的授权声明。

- [ ] **Step 2: 添加贡献和安全说明**

`CONTRIBUTING.md` 写明 Node、Rust、Tauri、测试和提交规范；`SECURITY.md` 明确禁止提交 API Key，安全问题不通过公开 Issue 发送。

- [ ] **Step 3: 添加行为规范和模板**

Bug 模板收集版本、Windows 版本、复现步骤、Provider 类型和日志脱敏信息；Feature Request 模板要求说明使用场景和期望输入/输出；PR 模板检查测试、文档和敏感信息。

- [ ] **Step 4: Commit**

```powershell
git add LICENSE CONTRIBUTING.md SECURITY.md CODE_OF_CONDUCT.md .github/ISSUE_TEMPLATE .github/pull_request_template.md
git commit -m "chore(repository): 增加开源协作基础文件"
```

## Task 4: 增加架构和产品演示文档

- [ ] **Step 1: 编写处理链路图**

`docs/architecture.md` 展示：语音/文本/选区 → ASR 或 LLM → 预览/写回/复制，并标注检索答案默认不自动写回。

- [ ] **Step 2: 完善首次使用文档**

完善 Task 2 已创建的 `docs/getting-started.md`，按用户顺序说明安装、配置 ASR、配置 LLM、可选检索、首次快捷键操作和常见错误。

- [ ] **Step 3: 准备录制脚本**

录制素材必须使用真实应用和脱敏文本，至少包含 8–15 秒的原文写回 GIF，以及文本整理、翻译、检索各一个输入/输出案例。

- [ ] **Step 4: Commit**

```powershell
git add docs/architecture.md assets
git commit -m "docs(repository): 增加产品演示与架构说明"
```

## Task 5: 建立持续集成和发布基础

- [ ] **Step 1: 编写 CI workflow**

`.github/workflows/ci.yml` 在 Windows runner 上执行 `npm ci`、`npm run build`、`npm test -- --run` 和 `cargo check --manifest-path src-tauri/Cargo.toml`；不把真实 API Key 写入 workflow。

- [ ] **Step 2: 验证 Tauri 打包配置**

确认 bundle 图标、产品名、版本号和安装包格式，再决定是否把 `src-tauri/tauri.conf.json` 中的 `bundle.active` 改为 `true`。没有可验证安装包时，README 不放虚假的下载链接。

- [ ] **Step 3: 添加 Release 说明模板**

记录版本号、支持平台、已知问题、权限、Provider 配置和升级方式。首次发布必须包含可下载的 Windows 安装包。

- [ ] **Step 4: Commit**

```powershell
git add .github/workflows/ci.yml src-tauri/tauri.conf.json
git commit -m "ci(repository): 增加检查与 Windows 发布流程"
```

## Task 6: 最终内容审查和验证

- [ ] **Step 1: 检查首屏可读性**

确认 README 首屏在不展开全文的情况下包含产品名、价值、真实效果图、安装入口和当前平台状态。

- [ ] **Step 2: 检查文档一致性**

运行搜索确认 `InputMore`、功能名称、快捷键、平台、隐私和路线图在 README、docs 与代码中没有互相矛盾的说明。

- [ ] **Step 3: 运行验证命令**

```powershell
npm test -- --run
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

预期：三项命令成功；若 Windows 原生环境或工具链限制导致失败，必须在 README 的开发说明中记录具体错误和替代验证结果。

- [ ] **Step 4: Commit**

```powershell
git add README.md README.zh-CN.md docs .github assets
git commit -m "docs(repository): 完成产品级仓库发布准备"
```
