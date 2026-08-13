# 变更记录 #033 — 2026-08-13

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| bugfix, config | 🔴 高 | Tauri capability 未开放 `set-size`，前端动态测量虽执行但原生窗口始终保持 380×90 | 增加窗口尺寸和可调整状态权限，并在缩放期间临时启用 resizable，完成后恢复不可手动调整 |

## 涉及文件

- `src-tauri/capabilities/default.json` — 开放 `core:window:allow-set-size` 与 `core:window:allow-set-resizable`
- `src/App.tsx` — 调整尺寸前临时开启 resizable，完成后关闭

## 核心改动

- 通过真实桌面截图确认修复前结果态窗口仍为 `380×90`。
- 增加原生窗口尺寸相关 capability。
- 真实验证修复后结果态窗口变为 `380×139`，整理结果完整显示。
- 用户不能手动拖拽改变窗口大小，resizable 仅在程序内部调整尺寸时短暂开启。

## 验证

- 命令：`npx tsc --noEmit`
- 结果：通过 ✅
- 命令：`npm test -- --run --reporter=dot`
- 结果：16 个测试文件、44 个测试全部通过 ✅
- 命令：`npm run build`
- 结果：Vite 生产构建通过 ✅
- 真实桌面验证：修复前 `380×90`，修复后结果态 `380×139` ✅
