# 检索 Agent 模块设计

## 目标

将当前“一次搜索 + 一次 LLM 回答”的检索能力扩展为可持续对话的轻量 Agent，同时保持 `rawWrite`、`enhance`、`translate` 和现有搜索 Provider 的边界不变。

Agent 负责决定检索步骤、调用检索工具、维护当前问题的运行上下文，并生成带来源引用的答案。UI 只提交用户输入和继续对话事件，不了解 Agent Loop、Provider 或存储细节。

## 模块边界

```text
presentation
    ↓
application/retrievalAgentFlow
    ↓
capabilities/retrieval/agent
    ├── RetrievalAgent
    ├── RetrievalAgentLoop
    ├── RetrievalAgentTool
    ├── RetrievalConversation
    └── RetrievalAgentStore
          ↓                 ↓
    SearchProvider     DocumentProvider
          ↓                 ↓
      外部搜索服务       页面内容服务
```

Agent 模块集中保存 Agent 相关实现，但不直接依赖 React、Tauri、具体搜索 Provider 或具体 LLM Provider。

## 目录设计

```text
src/domain/retrieval/
  retrievalConversation.ts
  retrievalRun.ts
  retrievalSource.ts

src/capabilities/retrieval/
  SearchProvider.ts
  DocumentProvider.ts
  RetrievalService.ts
  agent/
    RetrievalAgent.ts
    RetrievalAgentLoop.ts
    RetrievalAgentModel.ts
    RetrievalAgentTool.ts
    RetrievalAgentStore.ts
    retrievalAgentPrompts.ts

src/application/
  retrievalFlow.ts
  retrievalAgentFlow.ts

src/infrastructure/retrieval/
  InMemoryRetrievalAgentStore.ts
  createRetrievalAgent.ts
  providers/
    FirecrawlDocumentProvider.ts
```

第一阶段使用 `InMemoryRetrievalAgentStore`，先验证 Agent 行为；需要历史记录和跨重启恢复时，再增加 SQLite 实现，不改变 Agent 接口。

## 核心数据结构

### 会话

```ts
type RetrievalConversation = {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: RetrievalMessage[];
  runs: RetrievalRun[];
};
```

会话用于继续追问。关闭浮窗或切换功能时结束当前会话，不能与普通文本整理或翻译共用上下文。

### 消息

```ts
type RetrievalMessage =
  | { id: string; role: 'user'; content: string; createdAt: string }
  | { id: string; role: 'assistant'; content: string; runId: string; citations: Citation[]; createdAt: string }
  | { id: string; role: 'tool'; toolName: string; runId: string; content: string; createdAt: string };
```

### 运行和步骤

```ts
type RetrievalRun = {
  id: string;
  sessionId: string;
  userMessageId: string;
  status: 'running' | 'completed' | 'cancelled' | 'failed';
  startedAt: string;
  completedAt?: string;
  steps: RetrievalStep[];
  answerId?: string;
  error?: string;
};
```

每次工具调用和模型调用都记录为步骤，用于调试、重放和解释答案来源。记录中不得包含 API Key、Authorization、Cookie 或其他凭据。

### 来源和文档

搜索摘要与页面正文分开保存：

```ts
type RetrievalSource = {
  id: string;
  title: string;
  url: string;
  snippet: string;
  providerId: string;
  retrievedAt: string;
};

type RetrievedDocument = {
  id: string;
  url: string;
  canonicalUrl?: string;
  title?: string;
  content: string;
  contentFormat: 'markdown' | 'text';
  providerId: string;
  fetchedAt: string;
  contentHash: string;
  expiresAt?: string;
};
```

答案引用稳定的 `sourceId` 或 `documentId`，不直接依赖 URL 字符串。

## Agent Loop 行为

Agent Loop 借鉴 `harness/pi` 的循环思想，但只保留检索所需能力：

1. 接收新的用户消息和已有会话；
2. 请求模型决定直接回答、搜索或获取页面；
3. 执行工具并将结果追加到上下文；
4. 限制最大工具调用轮数；
5. 检查 `AbortSignal` 和会话请求版本；
6. 生成带引用的最终答案；
7. 保存运行记录并返回用户可展示的结果。

第一阶段只提供两个工具：

- `search_web`：调用现有 `SearchProvider`；
- `fetch_page`：调用 `DocumentProvider`，后续接入 Firecrawl。

暂不提供文件、Shell、浏览器控制或自动写回工具。

## LLM 接口策略

当前 `LlmProvider` 只支持普通文本请求。为减少耦合，Agent 不直接假设所有 LLM 都支持工具调用，而是定义 Agent 专用的模型接口：

```ts
interface RetrievalAgentModel {
  generate(request: RetrievalAgentModelRequest, signal?: AbortSignal): Promise<RetrievalAgentModelResponse>;
}
```

基础设施层提供适配器，将具备工具调用能力的具体 LLM 适配为 `RetrievalAgentModel`。原有 `LlmProvider` 继续服务 `enhance` 和 `translate`，不强制所有 Provider 支持 Agent 工具调用。

## Application Flow

`retrievalAgentFlow` 负责：

- 校验用户输入；
- 创建和取消本轮 `AbortController`；
- 生成或复用 `sessionId`；
- 防止旧运行覆盖新运行；
- 把 Agent 事件转换为用户可理解的处理中、工具调用、答案和错误状态。

`retrievalFlow` 先保留当前一次性流程作为兼容入口。Agent MVP 验证稳定后，再决定是否将普通“检索”入口切换到 Agent Flow。

## UI 行为

第一阶段不大幅重写 `App.tsx`。只增加以下应用层回调：

```text
开始检索(query)
继续追问(sessionId, query)
取消当前运行()
关闭会话()
```

结果面板展示：

- 当前答案；
- 可点击的来源引用；
- 当前运行状态；
- “继续追问”输入框；
- 必要时显示“已搜索 / 正在读取页面”等轻量进度。

工具调用详情默认不展开，避免把 Agent 内部过程变成主界面噪音；调试信息保存在运行记录中。

## 约束和保护

- 每次运行最多执行固定数量的模型/工具轮次；
- 搜索结果和页面内容必须经过长度限制和归一化；
- 工具超时、取消和错误必须返回结构化错误；
- Agent 不能自动写回输入框；
- 答案只能引用本轮或会话中已获取的来源；
- 来源不足时明确说明，不允许模型伪造引用；
- 不记录 API Key 和原始授权头；
- 现有 `SearchProvider` 行为保持不变。

## 测试范围

- Agent Loop：直接回答、调用搜索、调用页面读取、达到最大轮数、取消；
- 会话：新会话、继续追问、消息顺序、运行隔离；
- 存储：序列化结构、来源引用、失败运行和取消运行；
- Application Flow：空输入、旧请求丢弃、错误映射和取消；
- Provider Adapter：工具调用请求归一化和响应解析；
- 回归：现有 `retrievalFlow`、`SearchProvider`、`rawWrite`、`enhance` 和翻译流程。

## 实施顺序

1. 定义 domain 数据结构和 Agent 专用模型/工具接口；
2. 写 Agent Loop 和内存 Store 的失败测试；
3. 实现固定轮数、取消和错误处理；
4. 接入现有 `SearchProvider`；
5. 接入 `DocumentProvider` 抽象，Firecrawl 作为独立适配器；
6. 增加 `retrievalAgentFlow` 和继续对话；
7. 接入最小 UI；
8. 完成全量回归和桌面端测试；
9. 再评估 SQLite、流式输出和更复杂的 Agent 策略。
