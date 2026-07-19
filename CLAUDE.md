# VirtualXposed-skills

## 这是什么

本仓库是 **VirtualXposed** 的教学文档站 + 源码解析项目，不是可运行 App 仓库。
VirtualXposed 是基于 VirtualApp + epic、在**免 Root** 环境下运行 Xposed 模块的 Android 虚拟化实现（支持 Android 5.0~10.0）。

仓库分两部分：
- `VirtualApp/` —— 原项目源码（只读参考，`lib` 模块含 464 个 Java + 96 个 native 源文件）
- `website/` —— VitePress 文档站，逐层拆解 VirtualXposed 的原理与源码

## 工作目录约定

- **改文档** → 改 `website/` 下的 Markdown，绝大多数工作发生在这里
- **查源码** → 读 `VirtualApp/lib/src/main/java/com/lody/virtual/`，包结构：`client/`(Hook 框架/IPC/Stub) · `server/`(虚拟系统服务) · `mirror/`(隐藏 API 镜像) · `helper/`(工具) · `remote/`(跨进程数据类) · `os/`
- **native 层** → `VirtualApp/lib/src/main/jni/`（libc hook / ART hook / inline hook）
- **不要改 `VirtualApp/` 源码**，它是只读参考本体

## 构建与验证文档站

```bash
cd website
pnpm install --frozen-lockfile
pnpm build        # 构建到 website/.vitepress/dist，零死链才算通过
pnpm dev          # 本地预览
```

任何文档改动后，用 `pnpm build` 验证无死链、无构建错误。

## 文档结构速查

| 目录 | 内容 |
|------|------|
| `website/guide/` | 入门：是什么、解决什么问题、快速使用、限制 |
| `website/architecture/` | 架构总览、进程模型、模块组成 |
| `website/features/` | 核心机制详解（虚拟化、Hook、Stub、IPC、PMS/AMS 等） |
| `website/xposed/` | 免 Root Hook 原理、模块加载、epic、资源 Hook 限制 |
| `website/reference/` | 逐模块源码参考（10 个 index.md 索引，覆盖 464 Java + 96 native） |
| `website/dev/` | 构建与文档站搭建 |

## 写文档的硬规则

1. **不臆造**：每个类/方法/字段必须从 `VirtualApp/lib/src` 源码 `grep` 真实提取
2. **源码跳转**：引用源码用 GitHub 路径 `https://github.com/android-security-engineer/VirtualXposed-skills/blob/vxp/VirtualApp/lib/src/main/java/...`
3. **新增文档页**：必须在 `website/.vitepress/config.mts` 对应 sidebar 注册，否则变死链
4. **回复语言**：始终用简体中文（用户全局偏好）

## AI Agent 对接资源

本仓库已为 Agent 提供三层对接能力，详见 `website/dev/for-agents.md`：
- `CLAUDE.md` / `AGENTS.md`（本文件）—— 项目级上下文
- `website/public/llms.txt` + `llms-full.txt` —— 站点级 llms.txt 协议入口
- `website/public/llms-index.json` —— 结构化源码索引（类→文件→模块→文档）
- `.claude/skills/virtualxposed/` —— Claude Code Agent skill（只读导航工具）
