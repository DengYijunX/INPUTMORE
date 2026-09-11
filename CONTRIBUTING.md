# Contributing to InputMore

感谢你参与 InputMore。项目欢迎 Bug 修复、文档改进、Provider 适配和经过讨论的功能提案。

## Local development

```powershell
npm install
npm test -- --run
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

需要测试 Windows 快捷键、选区读取或跨应用写回时，请使用真实桌面环境，并在报告中说明 Windows 版本和目标应用。

## Architecture rules

- Presentation 不直接调用 Provider、`fetch`、Tauri `invoke` 或 Windows API；
- Application 依赖 capability 接口，不依赖具体 Provider；
- Infrastructure 负责外部响应归一化和敏感信息边界；
- 异步流程必须支持取消并检查 session version；
- 不在日志、测试、截图或提交中包含 API Key。

## Pull requests

请在 PR 中说明用户问题、影响的层、测试命令、文档影响和 Windows 原生行为。提交信息使用 Conventional Commits，并使用中文描述，例如 `fix(output): 修复文本写回焦点丢失`。
