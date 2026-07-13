# AGENTS.md

本文件是面向所有 AI Agent 工具（Cursor、Aider、Windsurf 等）的项目入口。
Claude Code 用户请直接读 `CLAUDE.md`（内容一致，本文件为跨工具兼容而存在）。

完整项目说明、工作目录约定、构建命令、文档结构、写文档硬规则、Agent 对接资源清单，
全部见 [CLAUDE.md](./CLAUDE.md)。

## 一句话摘要

VirtualXposed 的教学文档站（VitePress）。改 `website/` 下的 Markdown，查源码读 `VirtualApp/lib/src`，改完跑 `cd website && pnpm build` 验证。所有引用的源码事实必须 `grep` 真实提取，不得臆造。
