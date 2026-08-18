# 变更记录 #020 — 2026-08-18

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, interaction | 🟡 中 | 空选区时部分 Windows 应用仍会把剪贴板残留内容返回为复制结果，且预览状态没有重新触发选区转写的入口 | 使用临时剪贴板哨兵值确认是否真的复制到选区，并允许预览状态重新触发 `Ctrl + 右 Alt` |

## 涉及文件

- `src/capabilities/input/SelectedTextInputPort.ts` — 增加唯一哨兵值和剪贴板恢复
- `src/capabilities/input/SelectedTextInputPort.test.ts` — 覆盖空选区残留内容场景
- `src/application/shortcutAvailability.ts` — 允许预览中的选区转写重新触发
- `src/application/shortcutAvailability.test.ts` — 覆盖预览状态重试

## 核心改动

- 读取选区前先写入唯一临时哨兵值。
- Ctrl+C 后仍为哨兵值时，明确判定没有选区，不会把旧内容送给 LLM。
- 无论成功、失败还是取消，尽力恢复用户原剪贴板。
- 结果预览状态下再次选择文本并按 `Ctrl + 右 Alt`，会重新进入处理流程。

## 验证

- `npm test -- --run` — 22 个测试文件、68 个测试全部通过 ✅
- `npm run build` — Vite 生产构建通过 ✅
- `cargo test --manifest-path src-tauri/Cargo.toml` — 4 个 Rust 测试通过 ✅
- `cargo check --manifest-path src-tauri/Cargo.toml` — 通过 ✅
- `git diff --check` — 无差异格式错误 ✅
