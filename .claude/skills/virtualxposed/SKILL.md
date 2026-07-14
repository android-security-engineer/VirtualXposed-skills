---
name: virtualxposed
description: Navigate the VirtualXposed codebase and documentation. Use when the user asks about how a system service is virtualized/hooked, where a class lives in source, how to write an Xposed module against VirtualXposed, or how a VirtualXposed feature (app virtualization, stub activity, IO redirect, mirror reflection, native hook) is implemented. Provides read-only lookup: locate source by class/service name, trace a capability to its implementation, generate hook-writing guidance. Does NOT modify code or expose any write API — VirtualXposed is a runtime container for Xposed modules, not a programmable SDK.
---

# VirtualXposed 导航 Skill

本 skill 让 AI Agent 高效服务于"理解 VirtualXposed 如何虚拟化/Hook 某系统服务、某类源码在哪、如何写 Xposed 模块"等问题。**全部只读**。

## 知识来源（按优先级）

1. **结构化索引**：`website/public/llms-index.json` —— 全部 Java 类 → 源码文件 → 模块 → 文档链接。查"某类在哪"用这个。
2. **站点知识**：`website/public/llms-full.txt` —— 全站知识浓缩单文件。查"某机制整体怎么工作"先读这个。
3. **源码本体**：`VirtualApp/lib/src/main/java/com/lody/virtual/` —— 细节核对读源码。
4. **详细文档**：`website/reference/` 下对应模块 Markdown。

## 四类工具操作

### 工具 A：按类名/服务名定位源码

当用户问"XxxStub 在哪"、"account 服务怎么 Hook 的"：
1. 读 `website/public/llms-index.json`
2. 在 `classes` 数组中按 `className` 或 `package` 关键词过滤
3. 返回匹配项的 `sourceUrl`（GitHub 直链）+ `module` + `docLink`

### 工具 B：按能力追踪实现路径

当用户问"虚拟定位怎么实现的"、"IO 重定向在哪一层"：
1. 先读 `website/public/llms-full.txt` 第 4 节"核心机制"拿到机制概览
2. 按 module 在 `llms-index.json` 过滤相关类（如 location → `client/hook/proxies` + `server` + `remote` 三个 module 的 location 相关类）
3. 给出"客户端代理 → 虚拟服务 → 数据类"三层实现链 + 各自源码链接

### 工具 C：生成 Xposed 模块编写指引

当用户问"怎么给某 App 写个 Hook 模块在 VirtualXposed 里跑"：
1. 说明 VirtualXposed 是运行容器不是 SDK（见 `reference.md` 第 1 节）
2. 指引写标准 Xposed 模块（实现 `IXposedHookLoadPackage`）
3. 提醒两大限制：不支持改系统、不支持资源 Hook
4. 参考 `website/xposed/how-it-works` 与 `website/xposed/module-loading`

### 工具 D：获取预编译 APK

当用户问"怎么安装 VirtualXposed"、"下载 APK"、"不要从源码编译"：
1. 说明 VirtualXposed 以 APK 形式分发，无需源码编译
2. 提供下载命令：`gh release download --repo android-security-engineer/VirtualXposed-skills --pattern '*.apk' --dir .`
3. 或指向 latest release 页面：`https://github.com/android-security-engineer/VirtualXposed-skills/releases/latest`
4. 说明 APK 已签名、支持 arm64-v8a/x86_64、Android 5.0~10.0
5. 若用户需从源码编译，指引 `/dev/build` 文档（含 jcenter 镜像、NDK r19c、keystore）

## 硬约束

- **只读**：本 skill 不修改任何文件，不暴露写操作 API
- **不臆造**：类名/方法/字段必须从 `llms-index.json` 或源码真实提取，查不到就如实说"未在索引中找到"
- **中文回复**：遵循用户全局偏好
