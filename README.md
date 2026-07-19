# VirtualXposed-skills

> VirtualXposed 的**教学文档站 + 源码解析**项目。基于 [VirtualXposed](https://github.com/android-hacker/VirtualXposed)（VirtualApp + epic），逐层拆解免 Root 运行 Xposed 模块的 Android 虚拟化实现（支持 Android 5.0~10.0）。

[![Build Status](https://github.com/android-security-engineer/VirtualXposed-skills/actions/workflows/android.yml/badge.svg)](https://github.com/android-security-engineer/VirtualXposed-skills/actions/workflows/android.yml)

本仓库不是可运行 App 仓库，分两部分：

- `VirtualApp/` —— VirtualXposed 原项目源码（只读参考，`lib` 模块含 464 Java + 96 native 源文件）
- `website/` —— VitePress 文档站，逐层拆解 VirtualXposed 的原理与源码：[在线访问](https://android-security-engineer.github.io/VirtualXposed-skills/)

## 快速开始

### 下载 APK

```bash
gh release download --repo android-security-engineer/VirtualXposed-skills --pattern '*.apk' --dir .
```

> 未配置签名 Secret 时 Release 为未签名降级版，Android 7+ 需用 apksigner 自行签名后安装。详见 [下载与构建文档](https://android-security-engineer.github.io/VirtualXposed-skills/dev/build)。

### 用 VirtualXposed

VirtualXposed 是一个免 Root、免解锁 Bootloader 的 App，让任意 Xposed 模块在普通 App 进程内加载并激活。两大限制：(1) 不支持修改系统；(2) 不支持资源 Hook。

使用步骤：

1. 下载 APK 安装到 Android 5.0~10.0 设备
2. 打开 VirtualXposed，点主页底部按钮 → Add App，把目标 App 和 Xposed 模块都装进虚拟环境
3. 在 VirtualXposed 内的 Xposed Installer 里激活模块
4. 点 Settings → Reboot 重启 VirtualXposed（无需重启手机）

> ⚠️ 目标 App 和 Xposed 模块**必须都装在 VirtualXposed 虚拟环境内**，任一装在宿主系统都不生效。

## 文档与源码

- [文档站](https://android-security-engineer.github.io/VirtualXposed-skills/) —— 入门、架构、功能详解、源码参考
- [源码参考索引](https://android-security-engineer.github.io/VirtualXposed-skills/reference/) —— 464 Java + 96 native 逐模块解析
- [本地构建](https://android-security-engineer.github.io/VirtualXposed-skills/dev/build) —— 从源码编译 APK

## AI Agent 对接

本仓库为 AI Agent 提供三层对接能力（[详见](https://android-security-engineer.github.io/VirtualXposed-skills/dev/for-agents)）：

- `CLAUDE.md` / `AGENTS.md` —— 项目级上下文
- `website/public/llms.txt` + `llms-full.txt` + `llms-index.json` —— llms.txt 协议与结构化源码索引
- `.claude/skills/virtualxposed/` —— Claude Code 只读导航 skill

## Credits

- [VirtualApp](https://github.com/asLody/VirtualApp)
- [epic](https://github.com/tiann/epic)
- [Xposed](https://github.com/rovo89/Xposed)

> 商业用途请遵循 VirtualApp 的 [声明](https://github.com/asLody/VirtualApp)。
