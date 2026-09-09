# 主浮窗体验优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将主浮窗初始态和各内容态统一为不溢出的图标文字交互面板，同时保持现有能力流程和 Provider 行为不变。

**Architecture:** 仅调整 presentation 层的结构和样式，并新增纯展示用的 `CapabilityIcon` 组件。`InputMoreWindow` 继续接收现有 `SessionState` 和回调，不直接调用 Application、Provider 或 Tauri；窗口尺寸仍由既有 ref/状态连接负责，新增 CSS 约束保证内容区滚动而不是胶囊边框溢出。

**Tech Stack:** React 18、TypeScript、CSS、Vitest、Testing Library、Tauri WebView2/CDP。

---

## 文件边界

- Create: `src/presentation/CapabilityIcon.tsx` — 文本、翻译、检索三种内联 SVG 图标，仅负责展示。
- Modify: `src/presentation/InputMoreWindow.tsx` — 去掉音符和 `InputMore`，替换初始态入口按钮，补齐语义化 focus 状态和稳定的内容区结构。
- Modify: `src/App.css` — 统一浮窗、入口按钮、输入区、结果区的尺寸和溢出规则；使用原有暖灰色系提亮 hover/focus。
- Modify: `src/App.test.tsx` — 更新空闲态断言，验证旧装饰元素不再渲染、入口图标和按钮可访问。
- Modify: `src/presentation/InputMoreWindow.test.tsx` — 增加 hover/focus、空输入、翻译语言选择和长内容展示测试。
- Create: `changelog/2026-09-09-010-floating-overlay-ux.md` — 记录本次前端体验优化。

不修改：`src/domain`、`src/state`、`src/application`、`src/capabilities`、`src/infrastructure`、`src/SettingsPage.tsx`、检索 Provider 和检索流程。

### Task 1: 先补初始态和交互状态的失败测试

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/presentation/InputMoreWindow.test.tsx`

- [ ] **Step 1: 将空闲态测试改为新的可访问结构**

在 `src/App.test.tsx` 中保留 `READY` 和 capsule 状态断言，删除对 `InputMore` 的存在断言，替换为：

```tsx
expect(screen.queryByText('InputMore')).not.toBeInTheDocument();
expect(screen.queryByText('♩')).not.toBeInTheDocument();
expect(screen.getByRole('button', { name: '文本转写' })).toHaveAccessibleName('文本转写');
expect(screen.getByRole('button', { name: '翻译' })).toHaveAccessibleName('翻译');
expect(screen.getByRole('button', { name: '网页检索' })).toHaveAccessibleName('网页检索');
```

- [ ] **Step 2: 增加图标和 hover/focus 的失败测试**

在 `src/presentation/InputMoreWindow.test.tsx` 增加一个 idle render helper，并添加：

```tsx
it('shows a semantic icon for each idle capability button', () => {
  renderIdleWindow();
  expect(screen.getByTestId('capability-icon-text')).toBeInTheDocument();
  expect(screen.getByTestId('capability-icon-translation')).toBeInTheDocument();
  expect(screen.getByTestId('capability-icon-retrieval')).toBeInTheDocument();
});

it('uses the same warm highlight for hover and keyboard focus', () => {
  renderIdleWindow();
  const button = screen.getByRole('button', { name: '翻译' });
  fireEvent.mouseEnter(button);
  expect(button).toHaveAttribute('data-interaction', 'hover');
  fireEvent.focus(button);
  expect(button).toHaveAttribute('data-interaction', 'focus');
});
```

测试只验证状态语义和 DOM 标记，不锁定具体浏览器计算后的 RGB 值，避免 CSS 渲染差异导致脆弱测试。

- [ ] **Step 3: 运行展示测试确认失败**

Run: `npx vitest --run src/App.test.tsx src/presentation/InputMoreWindow.test.tsx --reporter=dot`

Expected: FAIL，因为旧的 `InputMore`/音符仍然存在，图标 test id 和交互标记尚未实现。

- [ ] **Step 4: Commit failing tests**

```bash
git add src/App.test.tsx src/presentation/InputMoreWindow.test.tsx
git commit -m "test(presentation): 覆盖主浮窗新入口状态"
```

### Task 2: 增加能力图标组件并重构空闲态入口

**Files:**
- Create: `src/presentation/CapabilityIcon.tsx`
- Modify: `src/presentation/InputMoreWindow.tsx`

- [ ] **Step 1: 创建纯展示图标组件**

新增以下类型和组件，不依赖业务层：

```tsx
type CapabilityIconName = 'text' | 'translation' | 'retrieval';

type CapabilityIconProps = {
  name: CapabilityIconName;
};

export function CapabilityIcon({ name }: CapabilityIconProps) {
  const label = name === 'text' ? '文本图标' : name === 'translation' ? '翻译图标' : '检索图标';
  return (
    <svg
      data-testid={`capability-icon-${name}`}
      aria-label={label}
      aria-hidden="true"
      className="capability-icon"
      viewBox="0 0 24 24"
      focusable="false"
    >
      {name === 'text' && <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>}
      {name === 'translation' && <><path d="M4 6h8M8 3v3M6 6c.7 3 2.2 5.1 4.5 6.5M5 13l5-5M13 14h6M16 11v3M14 18l2-5 2 5M14.8 16h2.4" /></>}
      {name === 'retrieval' && <><circle cx="10.5" cy="10.5" r="5.5" /><path d="m15 15 5 5" /></>}
    </svg>
  );
}
```

所有 `path`、`rect`、`circle` 使用 `fill="none"`、`stroke="currentColor"`、`strokeWidth="1.7"`，由 CSS 继承现有暖白色。

- [ ] **Step 2: 用统一入口数据替换三处重复按钮**

在 `InputMoreWindow.tsx` 引入 `CapabilityIcon`，将三个空闲态按钮替换为：

```tsx
<button className="capability-button" type="button" aria-label="文本转写" onClick={onStartTextRewrite}>
  <CapabilityIcon name="text" />
  <span>文本</span>
</button>
<button className="capability-button" type="button" aria-label="翻译" onClick={onStartTranslation}>
  <CapabilityIcon name="translation" />
  <span>翻译</span>
</button>
<button className="capability-button" type="button" aria-label="网页检索" onClick={onStartRetrieval}>
  <CapabilityIcon name="retrieval" />
  <span>检索</span>
</button>
```

删除 `mic-icon` 和 idle `idle-label`，保留非 idle 状态的 waveform。对能力按钮监听 `onMouseEnter`/`onFocus` 时设置 `data-interaction`，离开/失焦时移除，方便视觉测试验证当前态。

- [ ] **Step 3: 运行展示测试确认仍只剩样式失败**

Run: `npx vitest --run src/App.test.tsx src/presentation/InputMoreWindow.test.tsx --reporter=dot`

Expected: 图标和 DOM 状态测试通过；CSS 相关断言尚未添加，其他现有输入选择测试继续通过。

- [ ] **Step 4: Commit component structure**

```bash
git add src/presentation/CapabilityIcon.tsx src/presentation/InputMoreWindow.tsx
git commit -m "refactor(presentation): 重构浮窗功能入口"
```

### Task 3: 实现暖色提亮反馈和统一溢出约束

**Files:**
- Modify: `src/App.css`
- Modify: `src/presentation/InputMoreWindow.tsx`

- [ ] **Step 1: 替换旧入口样式**

删除 `.mic-icon`、`.idle-label`、`.text-input-button` 的空闲态样式，新增：

```css
.capability-button {
  display: inline-flex;
  min-width: 62px;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid rgba(211, 201, 187, .5);
  border-radius: 999px;
  padding: 5px 10px;
  color: inherit;
  background: rgba(255,255,255,.07);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease, box-shadow 140ms ease;
}
.capability-button:hover,
.capability-button[data-interaction='hover'],
.capability-button:focus-visible,
.capability-button[data-interaction='focus'] {
  color: #fffaf2;
  background: rgba(255,255,255,.22);
  border-color: rgba(247,242,233,.78);
}
.capability-button:focus-visible,
.capability-button[data-interaction='focus'] {
  outline: 2px solid rgba(247,242,233,.78);
  outline-offset: 2px;
}
.capability-icon { width: 18px; height: 18px; flex: 0 0 auto; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
```

浅色主题使用同色系的深色文字和更亮的暖色背景覆盖，不能引入蓝色：

```css
.floating-card[data-theme='light'] .capability-button:hover,
.floating-card[data-theme='light'] .capability-button:focus-visible { color: #3d3934; background: rgba(255,255,255,.86); border-color: rgba(110,103,94,.7); }
```

- [ ] **Step 2: 固定内容区边界并避免横向溢出**

补充以下约束：

```css
.floating-card { overflow: hidden; }
.capsule-content { min-width: 0; flex-wrap: nowrap; }
.capsule-status { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.text-input-panel, .preview-panel, .retrieval-panel, .error-actions { min-width: 0; max-width: 100%; }
.text-input-panel textarea, .target-language-select { min-width: 0; max-width: 100%; }
.preview-panel, .retrieval-panel { max-height: min(62vh, 520px); overflow-y: auto; overflow-x: hidden; }
.preview-text, .preview-hint, .retrieval-answer, .error-message { overflow-wrap: anywhere; }
```

输入态的 panel margin 必须与顶部标题的左边距一致；操作按钮保留稳定的最小高度，不使用负 margin 把内容拉出容器。

- [ ] **Step 3: 运行展示测试和构建**

Run: `npx vitest --run src/App.test.tsx src/presentation/InputMoreWindow.test.tsx --reporter=dot`

Expected: PASS。

Run: `npm run build`

Expected: PASS，TypeScript 和 Vite 构建完成。

- [ ] **Step 4: Commit visual implementation**

```bash
git add src/App.css src/presentation/InputMoreWindow.tsx
git commit -m "feat(presentation): 优化浮窗交互反馈和溢出布局"
```

### Task 4: 补充长内容、空输入和错误态展示测试

**Files:**
- Modify: `src/presentation/InputMoreWindow.test.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: 添加展示边界测试**

覆盖以下可观察行为：

```tsx
it('keeps translation submit disabled for empty source text', () => {
  renderTranslationWindow({ textDraft: ' ', targetLanguage: 'zh-CN' });
  expect(screen.getByRole('button', { name: '翻译' })).toBeDisabled();
});

it('renders long preview text inside a scrollable result panel', () => {
  render(<InputMoreWindow state={{ tag: 'previewing', action: 'translate', text: '长文本'.repeat(200) }} {...baseProps} />);
  const panel = screen.getByTestId('preview-panel');
  expect(panel).toHaveClass('preview-panel');
  expect(screen.getByText('翻译结果')).toBeInTheDocument();
});

it('renders a user-facing error without exposing provider details', () => {
  render(<InputMoreWindow state={{ tag: 'error', action: 'translate', message: '翻译失败', retryable: false }} {...baseProps} />);
  expect(screen.getByText('翻译失败')).toBeInTheDocument();
  expect(screen.queryByText(/API Key|stack|Provider response/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: 运行完整前端测试**

Run: `npx vitest --run --reporter=dot`

Expected: all existing and new tests pass；rawWrite、enhance、translate 和 ask 的既有测试无回归。

- [ ] **Step 3: Commit regression tests**

```bash
git add src/App.test.tsx src/presentation/InputMoreWindow.test.tsx
git commit -m "test(presentation): 覆盖浮窗边界和结果展示"
```

### Task 5: 使用桌面端 CDP 验证真实布局

**Files:**
- Modify: `changelog/2026-09-09-010-floating-overlay-ux.md`

- [ ] **Step 1: 启动桌面端 CDP**

Run: `$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS='--remote-debugging-port=9222'; npm run tauri dev`

Expected: Tauri 桌面端启动，`http://127.0.0.1:9222/json/list` 能看到主浮窗页面。

- [ ] **Step 2: 通过 CDP 检查空闲态**

验证：没有音符和 `InputMore`；`READY`、三个图标文字按钮和设置入口均可见；鼠标悬停/键盘 focus 不改变窗口宽高。

- [ ] **Step 3: 通过 CDP 检查输入和结果态**

依次验证翻译、文本、检索：空输入禁用提交；输入后启用提交；取消回到空闲；长预览和错误文案不产生横向滚动；翻译目标语言仍然可选择。

- [ ] **Step 4: 完成构建验证并记录结果**

Run: `npm run build`

Run: `cargo check --manifest-path src-tauri/Cargo.toml`

将 CDP 验证结果和任何环境限制写入 `changelog/2026-09-09-010-floating-overlay-ux.md`，然后提交：

```bash
git add changelog/2026-09-09-010-floating-overlay-ux.md
git commit -m "test(presentation): 验证主浮窗桌面端布局"
```

## 完成标准

- 初始态只显示 `READY`、图标文字入口和设置按钮；
- hover/focus 只提亮当前按钮，使用现有暖色系，不引入蓝灰色；
- 输入、结果、来源和错误区域在长内容下不撑破浮窗；
- 翻译仍默认预览，检索流程和 Provider 行为不变；
- 相关测试、完整 Vitest、Vite build 和 Rust check 通过；
- 每个提交只包含一个明确意图，工作区最终干净。
