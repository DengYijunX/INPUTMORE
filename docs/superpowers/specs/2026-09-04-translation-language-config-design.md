# 翻译目标语言配置设计

## 目标

为翻译能力增加清晰、可复用的目标语言配置：用户在设置页维护最多 3 个常用目标语言并指定默认值，翻译浮窗提供快速选择；文本翻译和后续语音翻译共享同一配置来源。

## 范围

包含：

- 新增独立的翻译配置类型和本地存储 key；
- 设置页展示、添加、删除和设置默认目标语言；
- 浮窗翻译输入使用目标语言选择器；
- 翻译流程始终使用明确的目标语言；
- 配置缺失或异常时恢复安全默认值；
- 为配置、设置页和翻译入口增加测试。

不包含：

- 自定义 Prompt；
- 远程配置同步；
- 语音翻译快捷键接入；
- rawWrite、enhance、ask 的业务行为变化。

## 业务规则

1. 默认提供三个常用语言候选：英语（美国）、简体中文、日本語。
2. 用户最多保存 3 个目标语言。
3. 至少保留 1 个目标语言，不能删除最后一个语言。
4. 默认语言必须是已保存的目标语言。
5. 浮窗打开翻译输入时，预选配置中的默认语言。
6. 浮窗临时切换语言只影响当前任务；设置页修改才会持久化。
7. 翻译请求在进入 Provider 前必须再次校验目标语言。

## 分层设计

```text
SettingsPage / InputMoreWindow
        ↓ 回调和配置值
translationConfig.ts
        ↓ TranslationConfig
translationFlow
        ↓ TranslationRequest(targetLanguage)
TranslationService
        ↓ LlmProvider
```

配置属于 infrastructure，因为它负责 `localStorage` 持久化；目标语言作为翻译请求的一部分继续由 translation capability 和 application 层传递。UI 不直接读写 localStorage。

## 数据模型

```ts
type TranslationLanguage = {
  code: string;
  label: string;
};

type TranslationConfig = {
  languages: TranslationLanguage[];
  defaultLanguage: string;
};
```

`defaultLanguage` 保存 language code，而不是展示名称，避免界面文案变化影响请求。配置读取时校验 code、label、数量和默认值；非法配置返回默认配置。

## 交互设计

设置页新增“翻译目标语言”卡片：

- 使用简短说明文字解释“翻译时可快速选择常用目标语言”；
- 每行显示语言名称、默认标记和删除按钮；
- 提供语言选择器和“添加语言”按钮；
- 已达到 3 个语言时禁用添加；
- 默认语言使用单选或明确的“设为默认”操作；
- 保存成功后显示与现有配置一致的保存反馈。

浮窗翻译输入区：

- 原文输入框下方显示目标语言下拉选择；
- 默认选择来自 `loadTranslationConfig()`；
- 仍然禁止空目标语言提交；
- 不新增自定义 Prompt 输入项。

## 错误和兼容

- 没有旧配置时使用默认三个语言候选；
- localStorage JSON 损坏时使用默认配置；
- 旧配置中存在重复语言时去重；
- 当前翻译 Flow 的目标语言校验保持不变，配置只是输入来源，不替代最终校验；
- rawWrite、enhance、ask 不读取翻译配置。

## 测试策略

- 配置单元测试：默认值、保存读取、最多 3 个、删除最后一个保护、默认值合法性和损坏数据恢复；
- 设置页测试：展示配置、添加语言、删除语言、修改默认语言和保存；
- 翻译 UI 测试：默认语言显示、临时切换和空目标语言禁用提交；
- 现有翻译 Service/Flow 测试继续验证 Provider 调用前的目标语言校验；
- 完成前运行完整 Vitest、`npm run build` 和 Rust 检查。

## 验收标准

- 用户无需每次手动输入目标语言即可翻译；
- 最多保存 3 个目标语言且始终有一个默认语言；
- 设置页修改刷新后仍然有效；
- 浮窗临时切换语言不会意外修改持久化配置；
- 翻译、rawWrite、enhance、ask 原有行为均无回归。
