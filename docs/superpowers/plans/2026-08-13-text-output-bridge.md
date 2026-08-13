# 文本输出桥接 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Windows 上将整理结果自动插入当前光标位置或替换当前选区，并在失败时保留结果和复制兜底。

**Architecture:** 前端应用层只依赖 `TextOutputPort`。Tauri 基础设施通过官方 clipboard-manager 读写纯文本剪贴板，并通过一个 Windows 原生命令记录/恢复前台窗口、发送 Ctrl+V；会话版本号阻止取消后的异步写回。UI 继续使用现有 `writingBack`、`completed` 和 `error` 状态。

**Tech Stack:** React 19, TypeScript, Vitest, Tauri 2, Rust, Windows user32 APIs, `@tauri-apps/plugin-clipboard-manager`。

---

### Task 1: 建立输出端口领域契约

**Files:**
- Create: `src/capabilities/output/TextOutputPort.ts`
- Create: `src/capabilities/output/TextOutputPort.test.ts`

- [ ] **Step 1: Write the failing test**

创建纯 TypeScript 测试，验证领域端口的成功和失败结果类型可以被上层消费：

```ts
import { describe, expect, it } from 'vitest';
import type { OutputResult, TargetContext, TextOutputPort } from './TextOutputPort';

describe('TextOutputPort contract', () => {
  it('describes a captured target and successful insertion', async () => {
    const target: TargetContext = { id: 'window-1' };
    const output: TextOutputPort = {
      captureTarget: async () => target,
      insertText: async () => ({ ok: true, undoId: 'window-1:1' } satisfies OutputResult),
      copyText: async () => undefined,
    };

    expect(await output.captureTarget()).toEqual(target);
    expect(await output.insertText('整理后的文本', target)).toEqual({ ok: true, undoId: 'window-1:1' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/capabilities/output/TextOutputPort.test.ts`

Expected: FAIL because `src/capabilities/output/TextOutputPort.ts` does not exist.

- [ ] **Step 3: Write minimal implementation**

定义稳定的端口和结果类型：

```ts
export type TargetContext = { id: string };

export type OutputResult =
  | { ok: true; undoId?: string }
  | { ok: false; code: 'target_unavailable' | 'clipboard_unavailable' | 'paste_failed' | 'cancelled'; message: string };

export interface TextOutputPort {
  captureTarget(): Promise<TargetContext>;
  insertText(text: string, target: TargetContext): Promise<OutputResult>;
  copyText(text: string): Promise<void>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/capabilities/output/TextOutputPort.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/capabilities/output/TextOutputPort.ts src/capabilities/output/TextOutputPort.test.ts
git commit -m "feat(output): define text output port"
```

### Task 2: 接入 Tauri 剪贴板与 Windows 粘贴命令

**Files:**
- Modify: `package.json`
- Modify: `src-tauri/Cargo.toml`
- Modify: `src-tauri/src/lib.rs`
- Modify: `src-tauri/capabilities/default.json`
- Create: `src-tauri/src/output.rs`
- Create: `src/infrastructure/output/TauriTextOutput.ts`
- Create: `src/infrastructure/output/TauriTextOutput.test.ts`

- [ ] **Step 1: Write the failing adapter test**

用注入的系统依赖测试 adapter 的时序：保存旧文本、写入结果、恢复目标、发送粘贴、恢复旧文本；并覆盖 paste 失败时仍恢复剪贴板：

```ts
it('restores clipboard after a successful paste', async () => {
  const calls: string[] = [];
  const adapter = createTextOutput({
    captureForeground: async () => { calls.push('capture'); return 'window-1'; },
    readClipboard: async () => { calls.push('read'); return '用户原剪贴板'; },
    writeClipboard: async (text) => { calls.push(`clipboard:${text}`); },
    restoreForeground: async () => { calls.push('focus'); },
    sendPaste: async () => { calls.push('paste'); },
    waitForPaste: async () => { calls.push('wait'); },
  });

  const target = await adapter.captureTarget();
  expect(await adapter.insertText('整理结果', target)).toEqual({ ok: true });
  expect(calls).toEqual(['capture', 'read', 'clipboard:整理结果', 'focus', 'paste', 'wait', 'clipboard:用户原剪贴板']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/infrastructure/output/TauriTextOutput.test.ts`

Expected: FAIL because `createTextOutput` and the adapter do not exist.

- [ ] **Step 3: Add Tauri clipboard dependencies and permissions**

运行 `npm install @tauri-apps/plugin-clipboard-manager`，在 `src-tauri/Cargo.toml` 增加 `tauri-plugin-clipboard-manager = "2.3"`，在 `lib.rs` 注册插件，并在 `default.json` 增加 `clipboard-manager:allow-read-text` 和 `clipboard-manager:allow-write-text`。新增 `output.rs` 暴露三个命令：`capture_foreground_window`、`restore_foreground_window`、`send_paste`。

Windows 实现使用 `GetForegroundWindow`、`SetForegroundWindow` 和 `SendInput`；非 Windows 编译目标返回明确的 unsupported 错误，不伪造成功。

- [ ] **Step 4: Implement the adapter**

`TauriTextOutput` 使用 clipboard-manager 的 `readText`、`writeText`，通过 `invoke` 调用 Rust 命令。`insertText` 严格按以下顺序执行，并在 `finally` 中尽力恢复原剪贴板：

```ts
const previous = await readText();
try {
  await writeText(text);
  await invoke('restore_foreground_window', { id: target.id });
  await invoke('send_paste');
  await wait(120);
  return { ok: true };
} catch (error) {
  return { ok: false, code: 'paste_failed', message: toOutputMessage(error) };
} finally {
  await writeText(previous);
}
```

真实实现要在恢复前检查目标 ID 与捕获 ID 一致；读取剪贴板失败时直接返回 `clipboard_unavailable`，不发送粘贴。

- [ ] **Step 5: Run adapter tests**

Run: `npm test -- --run src/infrastructure/output/TauriTextOutput.test.ts`

Expected: PASS for success, clipboard failure, paste failure, and restoration ordering.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src-tauri/Cargo.toml src-tauri/Cargo.lock src-tauri/src/lib.rs src-tauri/src/output.rs src-tauri/capabilities/default.json src/infrastructure/output/TauriTextOutput.ts src/infrastructure/output/TauriTextOutput.test.ts
git commit -m "feat(output): add Windows paste bridge"
```

### Task 3: 将自动写回接入会话流程

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/state/sessionMachine.ts`
- Modify: `src/state/sessionMachine.test.ts`
- Modify: `src/domain/actions.ts` only if the existing event types need a narrowed output error

- [ ] **Step 1: Write failing state tests**

补充以下行为测试：`result_ready` 从 processing 进入 writingBack；`writeback_succeeded` 进入 completed；`escape` 在 writingBack 时回 idle；失败进入 error 且 retryable 为 true：

```ts
it('does not stay writable after cancellation', () => {
  const state = reduce({ tag: 'writingBack', action: 'enhance', text: '结果' }, { type: 'escape' });
  expect(state).toEqual({ tag: 'idle' });
});
```

- [ ] **Step 2: Run state tests to verify the cancellation case fails**

Run: `npm test -- --run src/state/sessionMachine.test.ts`

Expected: FAIL because `escape` currently does not reset `writingBack`.

- [ ] **Step 3: Implement state transition changes**

让 `escape` 覆盖 `writingBack` 和 `showingAnswer` 的即时取消；保留 `completed` 不被 Escape 改写。确保 `writingBack` 的失败事件保留 `action` 和可重试信息。

- [ ] **Step 4: Integrate capture and writeback in App**

新增 `outputRef = useRef<TextOutputPort>()` 和 `targetRef`。第一次快捷键从 idle 开始时先调用 `captureTarget()`；捕获失败则进入 error，不开始录音。整理结果返回后调用 reducer 进入 `writingBack`，然后执行 `insertText`。每个异步回调开始和结束都比较 `sessionVersionRef.current`，版本变化后不粘贴、不发送成功事件。

成功时派发 `writeback_succeeded`；失败时设置 error，同时保留 result 文本供复制按钮使用。`cancelCurrentTask` 递增版本号、abort、取消录音、清空目标引用并回到 idle。

- [ ] **Step 5: Update UI feedback and fallback copy**

`writingBack` 显示“正在写入”；`completed` 显示“已写入”；`error` 显示“写入失败”和“复制结果”按钮。复制按钮调用 `output.copyText(lastResult)`，不能直接操作剪贴板 API。取消按钮继续调用统一的 `cancelCurrentTask`。

- [ ] **Step 6: Run frontend tests and build**

Run: `npm test -- --run src/state/sessionMachine.test.ts src/capabilities/output/TextOutputPort.test.ts src/infrastructure/output/TauriTextOutput.test.ts`

Expected: PASS.

Run: `npm run build`

Expected: TypeScript check and Vite production build both succeed.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/state/sessionMachine.ts src/state/sessionMachine.test.ts src/domain/actions.ts src/presentation
git commit -m "feat(output): write enhanced text to active input"
```

### Task 4: Windows 真实场景验证与变更记录

**Files:**
- Create: `docs/superpowers/verification/2026-08-13-text-output-bridge.md`
- Create: `changelog/2026-08-13-001-text-output-bridge.md`

- [ ] **Step 1: Run Rust and frontend verification**

Run: `npm run build`

Run: `cargo check --manifest-path src-tauri/Cargo.toml`

Expected: both commands exit 0.

- [ ] **Step 2: Run manual Windows matrix**

在记事本、浏览器普通文本框、VS Code 编辑器和一个聊天软件中分别验证：

1. 光标位置插入；
2. 选区替换；
3. 原剪贴板文本在成功写回后恢复；
4. 写回处理中点击取消不产生粘贴；
5. 目标窗口关闭后显示失败并可复制；
6. 下一次快捷键可以重新开始。

把每项结果和失败应用记录到 `docs/superpowers/verification/2026-08-13-text-output-bridge.md`。

- [ ] **Step 3: Complete code-change record**

将变更记录 #001 的“涉及文件、核心改动、验证结果”补全，并写入 changelog 文件；记录实际命令和结果，不使用“已测试”这类无证据描述。

- [ ] **Step 4: Commit verification record**

```bash
git add docs/superpowers/verification/2026-08-13-text-output-bridge.md changelog/2026-08-13-001-text-output-bridge.md
git commit -m "docs(output): record writeback verification"
```

