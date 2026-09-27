# Getting started

## Requirements

- Windows 10 or later;
- Node.js and Rust when running from source;
- A working microphone for voice input;
- An ASR provider configuration;
- An OpenAI-compatible LLM configuration for enhancement, translation, or Ask.

## Run from source

```powershell
npm install
npm run tauri dev
```

## Build a Windows installer

To create the first distributable Windows installer, run:

```powershell
npm run tauri build
```

The NSIS installer is generated under `src-tauri/target/release/bundle/nsis/`.
The build uses the configured local providers at runtime; it does not package API keys.

Before opening a pull request, run:

```powershell
npm test -- --run
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

## First configuration

1. Open **Settings** from the floating capsule.
2. Configure an ASR provider, API URL, model, and API key.
3. Configure a text model for enhancement, translation, or Ask.
4. Configure Web Search only if you want occasional retrieval.
5. API keys are stored locally; never paste them into an issue or commit them.

## Shortcuts

| Shortcut | Behavior |
| --- | --- |
| Right Alt | Start/stop raw voice input and write the transcription back |
| Ctrl + Right Alt | Read selected text and enhance it |

## Troubleshooting

- **No microphone:** check Windows microphone permissions.
- **No selected text:** select text before pressing `Ctrl + Right Alt`.
- **Provider error:** verify the API URL, model, API key, and provider requirements.
- **No write-back:** keep the target app focused and use the copy fallback.
