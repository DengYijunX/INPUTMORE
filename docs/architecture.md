# Architecture

InputMore follows a layered desktop application design:

```text
Presentation -> Application flows -> Capabilities and ports
             -> Infrastructure adapters -> ASR / LLM / Search / Tauri / Windows
```

## Core flows

```text
Voice -> ASR -> raw text -> active app write-back
Voice or selection -> text enhancement -> preview -> copy
Text -> translation -> preview -> copy
Question -> web search -> LLM answer + sources -> preview -> copy
```

Raw Write is the default write-back path. Enhancement and translation currently use preview/copy behavior. Ask is preview-first and does not automatically insert generated information into another application.

## Boundaries

- `src/domain/` and `src/state/`: stable types and pure session rules.
- `src/application/`: cancellation, request versions, and end-to-end flows.
- `src/capabilities/`: provider-independent business services and ports.
- `src/infrastructure/`: ASR, LLM, search, Tauri, Windows, and local configuration adapters.
- `src/presentation/`: floating window and settings UI.
