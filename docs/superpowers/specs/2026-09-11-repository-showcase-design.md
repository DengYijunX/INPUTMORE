# InputMore 产品级开源仓库包装设计

## 目标

将仓库从“可运行的源码项目”提升为“用户愿意了解、下载、收藏和参与的开源产品仓库”。目标受众为海外开发者和开源用户，同时为中文用户提供完整辅助说明。首屏采用英文为主、中文辅助的策略。

## 产品叙事

品牌固定为 `InputMore`，主宣传语为：

> **More power for every input.**
> 让每一次输入都拥有更多可能。

长期产品定位使用平台无关的表达：

> **The AI input layer for every app.**

当前版本的 Windows 支持作为版本状态说明，不写入长期品牌口号。

## README 结构

README 首屏必须在 10 秒内回答产品是什么、有什么结果、如何开始使用：

1. Logo、产品名、主宣传语和产品定位；
2. 真实产品截图或 8–15 秒语音写回 GIF；
3. Download、Quick Start、Documentation、Roadmap 链接；
4. 一句话说明开源、Provider 无关和当前 Windows 支持；
5. Why InputMore；
6. Features 能力矩阵；
7. 真实使用场景的输入 → 结果示例；
8. 安装和首次配置；
9. Privacy & Security；
10. Architecture、Roadmap、Contributing 和 License；
11. 中文 README 或中文文档入口。

README 以当前已实现能力为准，不宣称尚未完成的跨平台支持、离线模型、多轮 Agent 或流式输出。

## 发布素材

### 必备素材

- 统一尺寸的产品 Logo 和仓库社交预览图；
- 浮窗在真实桌面场景中的主截图；
- 语音录入 → 转写 → 写回当前应用的 GIF；
- 文本整理、翻译、检索结果的输入/输出示例；
- Windows 安装包和 GitHub Release；
- 安装、首次配置、快捷键和权限说明。

### 增强素材

- 30–60 秒产品演示视频；
- 产品处理链路图；
- 隐私和数据流图；
- 中英文对照的场景示例；
- 后续 macOS/Linux 支持的路线图图示。

素材必须使用真实当前界面；没有实现的能力只能标记为 Planned，不使用伪造截图。

## GitHub 仓库基础设施

增加或完善：

- LICENSE；
- GitHub Topics；
- Issue 模板和 Feature Request 模板；
- Pull Request 模板；
- CONTRIBUTING.md；
- SECURITY.md；
- CODE_OF_CONDUCT.md；
- CHANGELOG 或 Releases 说明；
- GitHub Actions：类型检查、测试、构建和 Release 打包；
- README 中英文导航。

当前 Tauri 配置中的 `bundle.active` 为关闭状态，因此 Windows 安装包发布属于产品级仓库的前置工作，而不是 README 装饰项。

## 文案边界

- 不把 InputMore 称为输入法；
- 不把产品限定为语音转文字；
- 不把“AI input layer”写成已经支持所有平台；
- 不默认承诺本地离线或隐私保护，除非对应 Provider 和数据路径已经实现；
- 不把检索结果自动写回描述为默认行为；
- 所有功能状态必须区分 Available、In Progress 和 Planned。

## 验收标准

- 新用户只看 README 首屏即可理解核心用途；
- 用户能从 README 找到可运行的 Windows 安装包；
- GIF 能展示从快捷键到跨应用写回的完整闭环；
- 功能矩阵与 `docs/product-status-and-roadmap.md` 和实际代码一致；
- README 同时包含英文主内容和中文入口；
- 仓库具备基础贡献、问题反馈、安全报告和自动检查入口；
- 不泄露 API Key、个人路径或测试凭据；
- `npm run build`、相关测试和 `cargo check --manifest-path src-tauri/Cargo.toml` 通过，或在 README 中明确环境限制。

## 实施顺序

1. 统一产品定位和当前功能状态；
2. 准备主截图、GIF 和社交预览图；
3. 编写英文主 README 与中文辅助文档；
4. 添加许可证、贡献、安全和 Issue 模板；
5. 配置 CI 和 Windows Release；
6. 发布首个可下载版本；
7. 根据真实用户反馈迭代 README 和路线图。
