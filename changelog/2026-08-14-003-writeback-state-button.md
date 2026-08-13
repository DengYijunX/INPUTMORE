# 变更记录 #003 — 2026-08-14

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, ui | 🔴 高 | 前台焦点恢复失败会阻断后续粘贴，导致实际写入成功时仍显示 ERROR；复制操作缺少明显的可点击反馈 | 将焦点恢复失败降级为非阻断事件，继续执行粘贴；将复制文本改为带边框和底色的次级按钮 |

## 涉及文件

- `src/infrastructure/output/TauriTextOutput.ts` — 解耦焦点恢复和粘贴动作。
- `src/infrastructure/output/TauriTextOutput.test.ts` — 增加焦点恢复异常后仍继续粘贴的回归测试。
- `src/App.css` — 强化“复制文本”按钮的边框、底色和悬停反馈。

## 核心改动

- `restoreForeground()` 失败时不再直接返回 `paste_failed`。
- 只要 `sendPaste()` 和等待流程成功，就判定写回成功。
- “复制文本”改为胶囊形次级按钮，拥有边框、半透明底色和 hover 状态。

## 验证

- 回归测试：4 个相关测试全部通过。
- `npm run build`：通过。
- `git diff --check`：通过。
- 完整测试套件：待本次最终命令完成后补充。
