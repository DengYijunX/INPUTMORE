# Retrieval MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add a text-first retrieval flow that searches through a configurable HTTP provider, asks the active LLM to synthesize an answer with sources, and displays the result in the existing Tauri window using a scrollable retrieval layout.

**Architecture:** Keep retrieval separate from `TextTransformationService`. `SearchProvider` returns normalized search results; `RetrievalService` combines those results with the existing `LlmProvider`; the application flow owns cancellation and session transitions; the presentation layer only starts the flow and renders the answer. The first entry is a floating-window “检索” button, so no native shortcut changes are needed.

**Tech Stack:** React/TypeScript, Vitest, existing `LlmProvider`, Tauri floating window, configurable JSON HTTP search endpoint.

---

## File Map

- Create `src/capabilities/retrieval/SearchProvider.ts`: normalized search contract.
- Create `src/capabilities/retrieval/RetrievalService.ts`: search + answer orchestration.
- Create `src/infrastructure/providers/search/HttpSearchProvider.ts`: configurable HTTP adapter expecting `{ results: [{ title, url, snippet }] }`.
- Create `src/infrastructure/config/searchConfig.ts`: local search endpoint and API-key storage.
- Modify `src/domain/actions.ts`: add retrieval lifecycle states and result types.
- Modify `src/state/sessionMachine.ts`: add retrieving and answer-ready transitions.
- Create `src/application/retrievalFlow.ts`: application use case for one retrieval request.
- Modify `src/App.tsx`: add the text entry, submit/cancel path, and answer rendering.
- Modify `src/App.css`: add a bounded, scrollable retrieval result layout.
- Modify `src/SettingsPage.tsx`: add search endpoint and API-key fields.
- Modify `src/infrastructure/config/providerConfig.ts`: reuse the existing active LLM configuration when the retrieval flow creates its answer generator.
- Create tests next to each new service and flow.

## Task 1: Define the search contract

**Files:**
- Create: `src/capabilities/retrieval/SearchProvider.ts`
- Test: `src/capabilities/retrieval/SearchProvider.test.ts`

- [ ] **Step 1: Write the failing contract test**

```ts
it('describes normalized search results', () => {
  const result: SearchResult = {
    title: 'Example',
    url: 'https://example.test',
    snippet: 'A short result summary',
  };
  expect(result).toEqual({ title: 'Example', url: 'https://example.test', snippet: 'A short result summary' });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npx vitest --run src/capabilities/retrieval/SearchProvider.test.ts --pool=forks --poolOptions.forks.singleFork=true --no-file-parallelism`

Expected: FAIL because `SearchResult` and `SearchProvider` do not exist.

- [ ] **Step 3: Add the minimal contract**

```ts
export type SearchResult = { title: string; url: string; snippet: string };
export interface SearchProvider {
  search(query: string, signal?: AbortSignal): Promise<SearchResult[]>;
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run the same Vitest command. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/capabilities/retrieval
git commit -m "feat(retrieval): 定义搜索能力接口"
```

## Task 2: Implement the configurable HTTP search adapter

**Files:**
- Create: `src/infrastructure/providers/search/HttpSearchProvider.ts`
- Test: `src/infrastructure/providers/search/HttpSearchProvider.test.ts`

- [ ] **Step 1: Write tests for success, empty results, and HTTP failure**

The fake fetcher must assert `POST`, bearer authentication, JSON body `{ query }`, and normalize only valid result rows. Empty `results` returns `[]`; a non-2xx response throws `ProviderError`.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npx vitest --run src/infrastructure/providers/search/HttpSearchProvider.test.ts --pool=forks --poolOptions.forks.singleFork=true --no-file-parallelism`

Expected: FAIL because the adapter does not exist.

- [ ] **Step 3: Implement the adapter**

Use constructor config `{ endpoint: string; apiKey: string; fetcher?: typeof fetch }`. POST `{ query }` to the configured endpoint, send `Authorization: Bearer <apiKey>`, parse `{ results?: unknown[] }`, and keep rows whose `title`, `url`, and `snippet` are non-empty strings.

- [ ] **Step 4: Run focused tests and verify they pass**

Run the same command. Expected: all adapter tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/infrastructure/providers/search
git commit -m "feat(retrieval): 增加可配置搜索适配器"
```

## Task 3: Add retrieval service and answer synthesis

**Files:**
- Create: `src/capabilities/retrieval/RetrievalService.ts`
- Test: `src/capabilities/retrieval/RetrievalService.test.ts`

- [ ] **Step 1: Write tests**

Cover: blank query rejection; search results are passed into one LLM request; answer includes source context; empty search results return a user-facing “未找到相关结果” error; cancellation is forwarded to both providers.

- [ ] **Step 2: Run focused tests and verify they fail**

Run: `npx vitest --run src/capabilities/retrieval/RetrievalService.test.ts --pool=forks --poolOptions.forks.singleFork=true --no-file-parallelism`

Expected: FAIL because `RetrievalService` does not exist.

- [ ] **Step 3: Implement the service**

The service accepts `{ search: SearchProvider; llm: LlmProvider; model: string }`. It searches once, then calls `llm.generate` once with a system message requiring concise, source-grounded Chinese answers and a user message containing the query plus numbered result title/URL/snippet. It returns `{ answer, sources }`.

- [ ] **Step 4: Run focused tests and verify they pass**

Run the same command. Expected: all service tests PASS, including exactly one search call and one LLM call.

- [ ] **Step 5: Commit**

```bash
git add src/capabilities/retrieval
git commit -m "feat(retrieval): 增加检索答案编排服务"
```

## Task 4: Add domain state and application flow

**Files:**
- Modify: `src/domain/actions.ts`
- Modify: `src/state/sessionMachine.ts`
- Create: `src/application/retrievalFlow.ts`
- Tests: `src/domain/actions.test.ts`, `src/state/sessionMachine.test.ts`, and `src/application/retrievalFlow.test.ts`

- [ ] **Step 1: Write failing state and flow tests**

Cover `idle → textInput(ask) → processing(ask) → showingAnswer`, cancellation back to `idle`, stale session results ignored, and provider errors entering `error` without carrying old answer content.

- [ ] **Step 2: Run focused tests and verify they fail**

Run: `npx vitest --run src/state/sessionMachine.test.ts src/application/retrievalFlow.test.ts --pool=forks --poolOptions.forks.singleFork=true --no-file-parallelism`

Expected: FAIL because the retrieval states and flow do not exist.

- [ ] **Step 3: Implement minimal state and flow**

Use the existing `ask` action for retrieval/answer semantics. Add only the states and events required for one active request; do not add chat history or multi-turn state.

- [ ] **Step 4: Run focused tests and verify they pass**

Expected: state and flow tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/actions.ts src/state/sessionMachine.ts src/application/retrievalFlow.ts
git commit -m "feat(retrieval): 接入检索状态和应用流程"
```

## Task 5: Add local search configuration

**Files:**
- Create: `src/infrastructure/config/searchConfig.ts`
- Modify: `src/SettingsPage.tsx`
- Tests: `src/infrastructure/config/searchConfig.test.ts`

- [ ] **Step 1: Write failing persistence tests**

Cover saving/loading endpoint and API key, trimming endpoint whitespace, rejecting an empty endpoint, and never including the API key in logs or shortcut events.

- [ ] **Step 2: Run focused tests and verify they fail**

Run: `npx vitest --run src/infrastructure/config/searchConfig.test.ts --pool=forks --poolOptions.forks.singleFork=true --no-file-parallelism`

- [ ] **Step 3: Implement config helpers and settings fields**

Use the same local-storage pattern as existing ASR/LLM configuration. The settings page must show endpoint, API key, save action, and a non-secret connection status only.

- [ ] **Step 4: Run focused tests and verify they pass**

Expected: config tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/infrastructure/config/searchConfig.ts src/SettingsPage.tsx
git commit -m "feat(settings): 增加搜索 Provider 配置"
```

## Task 6: Add the same-window retrieval UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.css`
- Tests: `src/App.test.tsx` and a retrieval presentation test

- [ ] **Step 1: Write failing UI tests**

Cover the “检索” button entering text input, submitting non-empty text, showing a processing indicator, rendering a long answer inside a scrollable result panel, rendering source links, copying the answer, and cancelling back to idle.

- [ ] **Step 2: Run focused UI tests and verify they fail**

Run: `npx vitest --run src/App.test.tsx src/presentation/RetrievalResult.test.tsx --pool=forks --poolOptions.forks.singleFork=true --no-file-parallelism`

- [ ] **Step 3: Implement the UI**

Use the existing single Tauri window. Retrieval mode may resize the same window, but cap the result area height and use `overflow-y: auto`; do not create a second native window. Keep answer output manual-copy only.

- [ ] **Step 4: Run focused tests and verify they pass**

Expected: UI tests PASS and the existing raw-write/enhance tests remain green.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/App.css src/App.test.tsx src/presentation
git commit -m "feat(retrieval): 增加同窗口检索结果面板"
```

## Task 7: Integrate providers and verify end-to-end behavior

**Files:**
- Modify: `src/App.tsx` and provider factory/config files only where the tests require integration.
- Test: existing frontend tests plus manual verification notes.

- [ ] **Step 1: Run the complete focused regression suite**

```bash
npx vitest --run src/App.test.tsx src/state/sessionMachine.test.ts src/capabilities/retrieval src/infrastructure/providers/search --pool=forks --poolOptions.forks.singleFork=true --no-file-parallelism
```

- [ ] **Step 2: Build the application**

```bash
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

- [ ] **Step 3: Manually verify**

Verify configured endpoint success, empty results, HTTP failure, cancellation, long answer scrolling, source link opening, copy result, and that right Alt raw write plus Ctrl + right Alt selected-text enhance are unchanged.

- [ ] **Step 4: Commit the verification record**

Add `changelog/2026-08-18-030-retrieval-mvp.md` with the exact commands and manual results, then commit:

```bash
git add changelog/2026-08-18-030-retrieval-mvp.md
git commit -m "feat(retrieval): 完成文本检索 MVP"
```

## Self-Review

- Search and LLM are each called once per retrieval request.
- The search endpoint response is normalized before reaching the application layer.
- API keys stay in local configuration and never appear in logs or shortcut events.
- Retrieval uses the existing Tauri window with a bounded scrollable panel.
- Raw Write and Enhance do not depend on the search provider.
- Voice retrieval, automatic write-back, chat history, multi-turn agents, and provider aggregation are outside this plan.
