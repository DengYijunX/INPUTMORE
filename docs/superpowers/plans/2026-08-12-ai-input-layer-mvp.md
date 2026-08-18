# AI Input Layer MVP Implementation Plan

> **Current status (2026-08-18):** This is a historical implementation plan. The current product boundary is documented in `docs/product-status-and-roadmap.md`. Raw Write and Enhance are implemented; Translation and Search/Ask remain future work. Do not treat the original unchecked task list as the current execution queue.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Original goal:** Build a Windows desktop MVP that turns spoken input into lightly polished text, writes it back to the active application, and provides separate Translation and Ask actions through a shared model Provider interface.

**Architecture:** Use a Tauri 2 desktop shell with a React/TypeScript floating window and a Rust native bridge. Organize the application around domain rules, application use cases, capability ports, and infrastructure adapters: `presentation` emits user events, `application` orchestrates use cases, `domain` owns pure state/policy, `capabilities` exposes reusable AI operations, and `infrastructure`/Tauri adapters implement providers and OS integration. No UI or use case imports a concrete LLM, ASR, search, or Windows API implementation.

**Tech Stack:** Tauri 2, Rust, React, TypeScript, Vite, Vitest, Rust unit tests, Web Audio/MediaRecorder, an OpenAI-compatible HTTP client, Windows UI Automation/send-input integration, and clipboard fallback.

---

## File Map

Create the following focused units:

- `package.json`, `vite.config.ts`, `src/`, `src-tauri/`: Tauri application shell.
- `src/domain/actions.ts`: Action and lifecycle types.
- `src/domain/requests.ts`: request/result contracts shared by UI and service adapters.
- `src/state/sessionMachine.ts`: pure transition function for the floating-window state machine.
- `src/state/sessionMachine.test.ts`: exhaustive transition tests.
- `src/application/`: user-facing use cases and session orchestration.
- `src/capabilities/`: reusable transcription, text transformation, answering, retrieval, and write-back ports.
- `src/infrastructure/`: Provider implementations, configuration, storage, and logging adapters.
- `src/presentation/`: state-driven floating-window components.
- `src-tauri/src/adapters/`: global shortcuts, active-window context, write-back, clipboard, and microphone bridges.
- `src-tauri/src/lib.rs`: Tauri command/event registration.
- `tests/e2e/`: Playwright or Webdriver smoke scenarios for the UI shell.

## Task 1: Scaffold the Tauri application

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/src/lib.rs`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Create the minimal package and test scripts**

Define scripts for `dev`, `build`, `test`, `test:watch`, and `tauri`. Pin React, Vite, TypeScript, Vitest, and Tauri versions in `package.json`.

- [ ] **Step 2: Write the shell smoke test**

```tsx
import { render, screen } from '@testing-library/react';
import { App } from './App';

it('renders an idle input-layer shell', () => {
  render(<App />);
  expect(screen.getByRole('status')).toHaveTextContent('就绪');
});
```

- [ ] **Step 3: Run the test and verify it fails**

Run: `npm test -- --run src/App.test.tsx`

Expected: FAIL because `App` and the test environment do not exist yet.

- [ ] **Step 4: Add the smallest Tauri/React shell**

Render `<App />` from `src/main.tsx`; make `App` render a single status element with `就绪`. Configure Tauri to open a frameless, transparent, always-on-top window sized for the floating UI.

- [ ] **Step 5: Run the test and build**

Run: `npm test -- --run src/App.test.tsx` and `npm run build`.

Expected: PASS and a successful frontend build.

- [ ] **Step 6: Commit**

```bash
git add package.json vite.config.ts index.html src src-tauri
git commit -m "feat: scaffold desktop input layer"
```

## Task 2: Define domain contracts and the pure session state machine

**Files:**
- Create: `src/domain/actions.ts`
- Create: `src/domain/requests.ts`
- Create: `src/state/sessionMachine.ts`
- Create: `src/state/sessionMachine.test.ts`

- [ ] **Step 1: Write failing transition tests**

Cover these exact cases: idle + default shortcut → recording; recording + shortcut-up → transcribing; transcribing + success → processing; processing + success for `enhance` → writing back; processing + success for `ask` → showing answer; any cancellable state + Escape → idle; failure → error with retry available.

```ts
expect(reduce({ tag: 'idle' }, { type: 'shortcut', action: 'enhance', durationMs: 0 })).toEqual({
  tag: 'recording', action: 'enhance', startedAt: expect.any(Number)
});
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `npm test -- --run src/state/sessionMachine.test.ts`

Expected: FAIL because the types and reducer are missing.

- [ ] **Step 3: Define the minimal contracts**

Use these stable types:

```ts
export type Action = 'enhance' | 'translate' | 'ask';
export type SessionState =
  | { tag: 'idle' }
  | { tag: 'recording'; action: Action; startedAt: number }
  | { tag: 'transcribing'; action: Action; audioId: string }
  | { tag: 'processing'; action: Action; requestId: string }
  | { tag: 'writingBack'; action: 'enhance' | 'translate'; text: string }
  | { tag: 'showingAnswer'; text: string; requestId: string }
  | { tag: 'completed'; action: Action; undoId?: string }
  | { tag: 'error'; action?: Action; message: string; retryable: boolean };
```

Define `TransformRequest` with `action`, `sourceText`, optional `selectedText`, `targetLanguage`, and `instruction`; define `TransformResult` with `text`, `citations`, and `metadata`.

- [ ] **Step 4: Implement the pure reducer**

Implement `reduce(state, event)` with no timers, OS calls, or network calls. Invalid events must return the existing state, except Escape and explicit cancellation, which return `{ tag: 'idle' }` from cancellable states.

- [ ] **Step 5: Run all state tests**

Run: `npm test -- --run src/state/sessionMachine.test.ts`

Expected: PASS for every transition and invalid-event test.

- [ ] **Step 6: Commit**

```bash
git add src/domain src/state
git commit -m "feat: define input actions and session state machine"
```

## Task 3: Build the floating window UI around the state machine

**Files:**
- Create: `src/components/FloatingWindow.tsx`
- Create: `src/components/StatusView.tsx`
- Create: `src/components/AskInput.tsx`
- Modify: `src/App.tsx`
- Test: `src/components/FloatingWindow.test.tsx`

- [ ] **Step 1: Write UI behavior tests**

Verify that recording shows duration and “再次按键结束”; processing disables duplicate submit and shows a cancellable status; error shows retry/cancel; Ask shows an input area and an “插入答案” action; completed shows “已写入” and “撤回”.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- --run src/components/FloatingWindow.test.tsx`

Expected: FAIL because components are missing.

- [ ] **Step 3: Implement state-only rendering**

Render based only on `SessionState`. Keep the window compact, keyboard-first, always-on-top, and free of model/provider configuration controls. The default `enhance` action must not render a text input before recording; `translate` and `ask` may render typed/paste input controls.

- [ ] **Step 4: Wire events to callbacks**

Expose callbacks for `onStartRecording`, `onStopRecording`, `onCancel`, `onRetry`, `onInsertAnswer`, and `onUndo`. Do not call Tauri or Provider APIs inside presentational components.

- [ ] **Step 5: Run UI tests and build**

Run: `npm test -- --run src/components/FloatingWindow.test.tsx` and `npm run build`.

Expected: PASS and successful build.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/components
git commit -m "feat: add state-driven floating window"
```

## Task 4: Implement capability ports and the Provider adapter

**Files:**
- Create: `src/capabilities/text/TextTransformer.ts`
- Create: `src/capabilities/text/TextTransformationService.ts`
- Create: `src/capabilities/answering/Answerer.ts`
- Create: `src/capabilities/retrieval/AnsweringPolicy.ts`
- Create: `src/infrastructure/providers/llm/LlmProvider.ts`
- Create: `src/infrastructure/providers/llm/OpenAICompatibleLlm.ts`
- Create: `src/infrastructure/config/ConfigStore.ts`
- Test: `src/capabilities/text/TextTransformationService.test.ts`
- Test: `src/infrastructure/providers/llm/OpenAICompatibleLlm.test.ts`

- [ ] **Step 1: Write transformation tests with a fake Provider**

Test that `enhance` sends a conservative optimization prompt, `translate` includes a required target language, and `ask` requests an answer without applying the enhancement prompt. Test that the service always uses the single configured active model.

- [ ] **Step 2: Run focused tests to verify failure**

Run: `npm test -- --run src/capabilities/text/TextTransformationService.test.ts src/infrastructure/providers/llm/OpenAICompatibleLlm.test.ts`

Expected: FAIL because the service contracts are absent.

- [ ] **Step 3: Define the Provider interface**

```ts
export interface LlmProvider {
  generate(request: LlmRequest, signal?: AbortSignal): Promise<LlmResponse>;
}
```

`ProviderRequest` contains `model`, `messages`, and optional `temperature`, `maxTokens`, and `stream`; `ProviderResponse` contains `text` and optional `citations`.

- [ ] **Step 4: Implement conservative prompts**

For `enhance`, instruct the model to preserve meaning, facts, and tone, remove filler/repetition, add punctuation, and return only usable text. For `translate`, require the target language and forbid commentary. For `ask`, request a direct answer and allow citations when the retrieval adapter supplies them.

- [ ] **Step 5: Implement the OpenAI-compatible adapter**

POST to `${baseUrl}/chat/completions` with bearer authentication, parse the first choice, normalize HTTP/API errors into `ProviderError`, and accept arbitrary model names. Validate that the API key, base URL, and model are present before making a request.

- [ ] **Step 6: Add local configuration validation**

Store `baseUrl`, `apiKey`, `model`, and action shortcuts in the platform-appropriate local settings store. Never log or render the API key. Reject invalid URLs and empty models before a task starts.

- [ ] **Step 7: Run tests**

Run: `npm test -- --run src/capabilities/text/TextTransformationService.test.ts src/infrastructure/providers/llm/OpenAICompatibleLlm.test.ts`

Expected: PASS, including malformed response, timeout, and unauthorized response tests.

- [ ] **Step 8: Commit**

```bash
git add src/capabilities src/infrastructure
git commit -m "feat: add unified text transformer and provider"
```

## Task 5: Add application use cases and audio capture/transcription ports

**Files:**
- Create: `src/application/enhanceTranscription.ts`
- Create: `src/application/translateText.ts`
- Create: `src/application/askQuestion.ts`
- Create: `src/capabilities/transcription/Transcriber.ts`
- Create: `src/capabilities/transcription/TranscriptionService.ts`
- Create: `src/infrastructure/audio/audioCapture.ts`
- Create: `src/infrastructure/providers/asr/AsrProvider.ts`
- Modify: `src/App.tsx`
- Test: `src/infrastructure/audio/audioCapture.test.ts`
- Test: `src/capabilities/transcription/TranscriptionService.test.ts`

- [ ] **Step 1: Write tests for capture lifecycle**

Test start/stop produces a non-empty audio blob, stop is idempotent, cancellation discards the blob, and a microphone permission rejection maps to a user-facing `microphone_permission_denied` error.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- --run src/infrastructure/audio/audioCapture.test.ts src/capabilities/transcription/TranscriptionService.test.ts`

Expected: FAIL because capture and transcription adapters are missing.

- [ ] **Step 3: Implement MediaRecorder capture**

Request the microphone only when the default or special recording action begins. Collect chunks, expose elapsed time and level updates, stop tracks on every terminal path, and never retain audio after the request completes.

- [ ] **Step 4: Implement the transcription adapter contract**

Define `Transcriber.transcribe(audio: Blob, signal?: AbortSignal): Promise<string>`. Add an HTTP adapter configuration point; the first implementation may target the configured Provider’s transcription endpoint or a compatible endpoint, but must normalize empty transcripts and network errors.

- [ ] **Step 5: Connect capture to the reducer**

On stop, dispatch `transcriptionStarted`; on transcript success dispatch `transcriptionSucceeded` and then start `TextTransformer`; on permission, empty audio, or network errors dispatch `failed` with retryability metadata.

- [ ] **Step 6: Run focused tests and build**

Run: `npm test -- --run src/services/audioCapture.test.ts src/services/transcription.test.ts` and `npm run build`.

Expected: PASS and successful build.

- [ ] **Step 7: Commit**

```bash
git add src/application src/capabilities/transcription src/infrastructure/audio src/infrastructure/providers/asr src/App.tsx
git commit -m "feat: add microphone capture and transcription flow"
```

## Task 6: Implement Windows shortcut, context, and write-back adapters

**Files:**
- Create: `src-tauri/src/adapters/shortcuts.rs`
- Create: `src-tauri/src/adapters/active_window.rs`
- Create: `src-tauri/src/adapters/writeback.rs`
- Create: `src-tauri/src/adapters/clipboard.rs`
- Modify: `src-tauri/src/lib.rs`
- Test: `src-tauri/src/writeback.rs` unit tests

- [ ] **Step 1: Write pure write-back tests**

Test insertion at a cursor, replacement of selected text, undo of an insertion, undo of a replacement, and refusal to undo when the target text no longer matches the recorded generated text.

- [ ] **Step 2: Run Rust tests to verify failure**

Run: `cargo test --manifest-path src-tauri/Cargo.toml`

Expected: FAIL because the native modules are absent.

- [ ] **Step 3: Implement shortcut registration**

Register separate configurable shortcuts for `enhance`, `translate`, and `ask`. Emit Tauri events for key-down, key-up, and cancellation. Preserve press-duration semantics only for the default action if the chosen shortcut supports it; do not overload Escape.

- [ ] **Step 4: Capture the active context**

Before the floating window takes focus, capture active window identity, selected text when available, and the intended cursor target. Return a capability result rather than assuming every application is writable.

- [ ] **Step 5: Implement write-back and clipboard fallback**

Use the native input mechanism for insertion/replacement. Record an undo snapshot containing target identity, original text, generated text, and timestamp. If focus or accessibility checks fail, copy the generated result and return `writeback_unavailable` without modifying the current application.

- [ ] **Step 6: Expose Tauri commands**

Expose `capture_context`, `write_text`, `undo_write`, `copy_text`, and `open_permission_settings`. Keep secrets and raw audio out of event payloads.

- [ ] **Step 7: Run Rust tests and format**

Run: `cargo fmt --check` and `cargo test --manifest-path src-tauri/Cargo.toml`.

Expected: formatting passes and all pure write-back tests pass.

- [ ] **Step 8: Commit**

```bash
git add src-tauri
git commit -m "feat: add Windows shortcuts and write-back bridge"
```

## Task 7: Integrate actions and failure recovery

**Files:**
- Modify: `src/App.tsx`
- Create: `src/application/sessionController.ts`
- Modify: `src/state/sessionMachine.ts`
- Test: `src/application/sessionController.test.ts`

- [ ] **Step 1: Write controller tests**

Test complete flows for enhance, translate, and Ask using fake recorder, transcriber, Provider, and native bridge. Verify enhance/translate call write-back, Ask does not, cancellation aborts the active request, and Provider failure produces retryable UI state.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- --run src/application/sessionController.test.ts`

Expected: FAIL because the controller is missing.

- [ ] **Step 3: Implement the controller**

The controller translates native shortcut events into reducer events, coordinates recorder/transcriber/transformer, creates an `AbortController` per task, and ensures every terminal path stops media tracks and clears transient audio/text data.

- [ ] **Step 4: Add retry and recovery behavior**

Retry the same task once after a transient Provider/network failure. Expose explicit actions for retry, copy result, open settings, cancel, insert Ask answer, and undo. Do not automatically switch Provider.

- [ ] **Step 5: Run controller and all frontend tests**

Run: `npm test -- --run`.

Expected: all unit and component tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/application/sessionController.ts src/state/sessionMachine.ts
git commit -m "feat: integrate input actions and recovery"
```

## Task 8: Add settings, permission UX, and desktop smoke tests

**Files:**
- Create: `src/components/SettingsView.tsx`
- Create: `src/services/permissionStatus.ts`
- Create: `tests/e2e/floating-window.spec.ts`
- Create: `tests/e2e/error-recovery.spec.ts`
- Modify: `src/settings/config.ts`

- [ ] **Step 1: Write settings validation tests**

Test empty API key, invalid base URL, empty model, duplicate shortcuts, and valid OpenAI-compatible configuration. Assert that API keys never appear in rendered settings or error strings.

- [ ] **Step 2: Implement settings and permission states**

Show microphone, write-back, and Provider readiness separately. Request each permission only at first use and explain its purpose before opening system settings.

- [ ] **Step 3: Add desktop smoke scenarios**

Cover: launching the shell shows idle; triggering enhance shows recording; stopping shows processing; a fake result reaches completed; Ask shows an answer without write-back; error state offers retry and cancel.

- [ ] **Step 4: Run the complete verification set**

Run:

```bash
npm test -- --run
cargo fmt --check
cargo test --manifest-path src-tauri/Cargo.toml
npm run build
```

Expected: all tests pass, Rust formatting passes, and the production build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src tests
git commit -m "test: cover settings permissions and desktop flows"
```

## Self-Review Checklist

- Historical coverage: the original plan covered default optimized transcription, translation, Ask, floating state feedback, write-back, and Provider abstraction.
- Current scope: Raw Write and Enhance are implemented; Translation and Search/Ask are not yet implemented and should be planned separately.
- Current behavior: Raw Write is the default Right Alt flow; Enhance is explicitly triggered by the Text entry or Ctrl + Right Alt selected-text shortcut and previews results for manual copy.
- Consistency: `Action` uses `enhance | translate | ask` throughout; `TransformRequest` is the only task input; the Provider interface is independent of UI and native bridge.
- Security: API keys are local-only and excluded from logs/events; audio is released on terminal paths; Provider failover is opt-in and absent from MVP.
