# Privacy and data flow

InputMore is a desktop client. It does not operate a central hosted AI backend for the project.

## What leaves the device

- Voice audio leaves the device when the configured ASR provider requires a remote request.
- Text leaves the device when you start enhancement, translation, or retrieval and the configured provider requires it.
- Retrieval requests may be sent to the configured search provider; returned source links are shown in the floating window.

The exact retention, training, and regional processing policy depends on the provider you configure. Review that provider's terms before using sensitive content.

## What stays local

- Provider configuration and API keys are stored locally by the current application.
- InputMore does not intentionally log API keys, audio content, or full provider responses.
- The current application does not provide cloud history or account synchronization.

Before sharing logs or screenshots, remove API keys, authorization headers, private text, token-bearing URLs, and private filesystem paths. Security concerns should follow [SECURITY.md](../SECURITY.md).
