# InputMore 开发规范

## 项目定位

InputMore 是一个基于 Tauri 2、React、TypeScript 和 Rust 的 Windows 桌面 AI 输入增强层。
它通过明确的入口处理语音或文本，再将结果写回当前应用，或在浮窗中展示给用户。

当前主要能力：

- `rawWrite`：语音转录后原文写回；
- `enhance`：文本或选中文字整理；
- `ask`：网页检索并基于来源生成答案；
- `translate`：预留的翻译 Action，入口和完整流程仍需继续实现。

## 分层架构

代码按以下方向依赖：

```text
presentation → application → capabilities → infrastructure → 外部系统
                         ↘ domain/state ↗
```

### `domain/` 和 `state/`

负责稳定的业务概念和纯规则：

- Action、请求、结果和错误类型；
- `SessionState` 和 `SessionEvent`；
- 状态转换、取消规则、过期请求规则；
- 不变量和纯业务策略。

禁止依赖 React、Tauri、HTTP、具体 Provider 或 Windows API。
状态机必须保持纯函数，并为状态转换编写单元测试。

### `presentation/`

负责界面展示和用户事件：

- 浮窗、输入框、状态、结果、来源列表；
- 调用回调通知应用层；
- 根据 `SessionState` 渲染界面。

组件不得直接调用 `fetch`、Tauri `invoke`、具体 Provider 或 Windows API。

### `application/`

负责一个完整的用户任务流程：

- 编排输入、能力调用、结果处理和写回；
- 管理 `AbortController`、取消和请求版本；
- 将技术错误转换为用户可理解的状态；
- 驱动状态机。

推荐每个主要能力拥有独立 Flow：

```text
application/rawWriteFlow.ts
application/enhanceFlow.ts
application/translationFlow.ts
application/retrievalFlow.ts
application/selectedTextFlow.ts
```

不要把完整业务流程继续堆在 `App.tsx`。`App.tsx` 最终只应负责页面组合、状态连接和事件转发。

### `capabilities/`

负责可复用的业务能力和抽象接口：

- 语音转录；
- 文本整理；
- 翻译；
- 检索问答；
- 选中文字读取；
- 文本写回。

能力层依赖抽象接口，不依赖具体供应商。例如翻译和检索可以共享 `LlmProvider`，但应拥有各自的 Service、Prompt 和结果类型。

推荐结构：

```text
capabilities/
  transcription/
  text/
  translation/
  retrieval/
  input/
  output/
```

### `infrastructure/`

负责外部系统的具体适配：

- LLM、ASR、Search Provider；
- Tauri 命令和事件；
- Windows 活动窗口、快捷键、剪贴板和写回；
- `localStorage`、网络请求和配置持久化。

基础设施实现能力层定义的接口。更换 Provider 时，不应要求重写 Application 或 Presentation。

## 新功能开发流程

每个功能按垂直切片完成，不要先创建大量没有行为的空目录。

1. 在 `domain/` 定义请求、结果、Action 和状态转换；
2. 为状态机和核心能力先写测试；
3. 在 `capabilities/` 实现业务 Service；
4. 在 `infrastructure/` 实现 Provider 或系统适配器；
5. 在 `application/` 编排完整 Flow；
6. 在 `presentation/` 接入输入和结果展示；
7. 添加取消、超时、空结果、错误和过期请求测试；
8. 运行相关测试、完整测试和构建验证。

翻译和检索的边界：

- 翻译使用独立的 `TranslationService`，不要将翻译 Prompt 堆进 `TextTransformationService`；
- 检索使用独立的 `RetrievalService`，由 `SearchProvider` 获取来源，再使用 `LlmProvider` 生成答案；
- 翻译默认可以写回或预览，但行为必须由明确的产品规则决定；
- 检索默认展示答案和来源，不自动写回，插入必须是用户主动操作。

## 依赖和接口规则

- UI 不得实例化具体 Provider；
- Application 不得依赖具体搜索、LLM、ASR 或 Windows 实现；
- Capability 不得读取 UI 状态或直接操作窗口；
- Infrastructure 不得反向依赖 React 组件；
- 跨层传递使用明确的 TypeScript 类型，不传递 Provider 原始响应；
- 外部响应必须在 Infrastructure 层归一化和校验；
- 所有网络和系统调用都必须支持取消或明确说明不支持取消；
- API Key 不得进入日志、快捷键事件、错误详情或提交记录。

## 并行开发规范

### 文件边界

翻译和检索应尽量修改各自目录：

```text
翻译：capabilities/translation、application/translationFlow、翻译 UI
检索：capabilities/retrieval、application/retrievalFlow、Search Provider、检索 UI
公共：domain/actions、state/sessionMachine、App.tsx、SettingsPage.tsx
```

公共文件先确定接口，再由各功能分支接入。不要让两个功能同时大幅重写 `App.tsx`、`actions.ts` 或 `sessionMachine.ts`。

### Git 提交

使用小而完整的提交：

```text
feat(shared): define translation request contract
feat(translation): add translation service
feat(retrieval): extract retrieval flow
test(retrieval): cover cancellation and empty results
```

每个提交尽量只包含一个层次或一个功能意图。合并前先同步主分支，并运行受影响模块的测试。

## 测试规范

- Domain/State：纯单元测试，覆盖合法和非法状态转换；
- Capabilities：使用 fake Provider，验证请求内容、调用次数和取消；
- Infrastructure：模拟 `fetch`、Tauri、剪贴板和 Windows 边界；
- Application：验证完整流程、错误恢复、取消和过期结果丢弃；
- Presentation：验证用户操作和状态渲染，不测试 Provider 细节；
- 集成测试：验证真实模块连接，但避免依赖真实 API Key；
- 完成前至少运行相关测试、`npm run build` 和 `cargo check --manifest-path src-tauri/Cargo.toml`。

## 当前高风险区域

- `src/App.tsx` 仍包含较多业务编排，新增流程应优先抽到 `application/`；
- `domain/actions.ts` 和 `state/sessionMachine.ts` 是所有功能共享的边界，修改必须补回归测试；
- `SettingsPage.tsx` 同时承载多类 Provider 配置，新增配置应使用独立存储 key 和独立测试；
- 原文写回和检索答案插入的语义不同：前者是流程默认输出，后者必须由用户主动确认；
- 任何异步结果回写 UI 前，都必须检查取消状态和 session version，避免旧请求覆盖新状态。

## 验证和完成标准

不能只因为 TypeScript 编译通过就认为功能完成。完成前必须确认：

- 核心路径测试通过；
- 原有 rawWrite、enhance 和 ask 流程没有回归；
- 取消、重复触发、网络失败、空结果和 Provider 错误有明确行为；
- UI 不会展示旧请求结果；
- API Key 和来源信息不会被错误记录；
- `npm run build` 和 Rust 检查通过，或明确记录环境限制。
