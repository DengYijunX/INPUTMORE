# Windows Release Packaging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable a reproducible Windows installer build for InputMore 0.1.0 without changing runtime behavior.

**Architecture:** Keep packaging concerns in `src-tauri/tauri.conf.json` and existing Tauri icon assets. The frontend build remains the configured `beforeBuildCommand`; Tauri produces the Windows bundle from the existing Rust desktop application.

**Tech Stack:** Tauri 2, Rust, React, Vite, Windows NSIS installer.

---

### Task 1: Record the current packaging boundary

**Files:**
- Inspect: `src-tauri/tauri.conf.json`
- Inspect: `src-tauri/icons/`

- [x] Confirm the current bundle is disabled and identify reusable icon files.
- [x] Keep the product version aligned at `0.1.0` in `package.json` and `src-tauri/tauri.conf.json`.

### Task 2: Enable the Windows installer

**Files:**
- Modify: `src-tauri/tauri.conf.json`

- [x] Set `bundle.active` to `true`.
- [x] Configure `bundle.targets` for `nsis` so the first release produces a Windows installer.
- [x] Configure `bundle.icon` with the existing PNG/ICO icon assets.
- [x] Keep NSIS options conservative: no runtime behavior changes and no new project dependency.

### Task 3: Document the release build

**Files:**
- Modify: `docs/getting-started.md`
- Modify: `README.md`
- Modify: `README.zh-CN.md`

- [x] Document `npm run tauri build` as the release build command.
- [x] Explain that the installer is emitted under `src-tauri/target/release/bundle/nsis/`.
- [x] Keep download wording honest until a GitHub Release exists.

### Task 4: Verify the release path

**Files:**
- No source test files are needed; this is packaging configuration.

- [x] Run `npm run build`.
- [x] Run `cargo check --manifest-path src-tauri/Cargo.toml`.
- [x] Run `npm run tauri build` and confirm an NSIS installer exists.
- [x] Record the exact outputs in the change log.

### Task 5: Commit the release configuration

- [x] Review `git diff` and `git status`.
- [x] Commit with `chore(release): 配置 Windows 安装包`.

### Follow-up: Hide the release console window

**Files:**
- Modify: `src-tauri/src/main.rs`

- [x] Enable the Windows GUI subsystem for non-debug builds.
- [x] Rebuild the NSIS installer and verify the release binary is marked as a Windows GUI application.
