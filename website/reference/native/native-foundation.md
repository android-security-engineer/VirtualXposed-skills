# native/Foundation · 核心功能综述

::: tip 源码路径
[`src/main/jni/Foundation/`](https://github.com/android-security-engineer/VirtualXposed-skills/tree/vxp/VirtualApp/lib/src/main/jni/Foundation)
:::

native 层核心，12 个文件，承载 IO 重定向、ART 方法 hook、符号查找、路径管理。已按文件拆为 6 篇细分文档：

| 文档 | 源文件 | 职责 |
| --- | --- | --- |
| [IOUniformer](./native-io-uniformer) | IOUniformer.cpp | libc/execve/dlopen hook 总入口 |
| [SandboxFs](./native-sandbox-fs) | SandboxFs.cpp | 路径重定向引擎（keep/forbid/replace 三表） |
| [Path](./native-path) | Path.cpp | 路径规范化工具 |
| [fake_dlfcn](./native-fake-dlfcn) | fake_dlfcn.cpp | 绕过 linker 的 dlopen/dlsym |
| [SymbolFinder](./native-symbol-finder) | SymbolFinder.cpp | ELF 符号运行时地址查找 |
| [VMPatch](./native-vm-patch) | VMPatch.cpp | ART VM 方法 hook 入口 |

## Foundation 在 native 层的位置

```mermaid
flowchart TD
  JNI["Jni/VAJni.cpp<br/>(Java→native 桥)"] --> VM["VMPatch<br/>(ART hook)"]
  VM --> SF["SymbolFinder<br/>(定位符号)"]
  SF --> FDL["fake_dlfcn<br/>(取内部符号)"]
  JNI --> IO["IOUniformer<br/>(libc hook)"]
  IO --> SB["SandboxFs<br/>(路径重定向)"]
  SB --> PT["Path<br/>(规范化)"]
```

## IOUniformer 工作流

```mermaid
sequenceDiagram
  participant App as 目标 App
  participant Libc as libc open
  participant IOU as IOUniformer wrapper
  participant SB as SandboxFs 规则表
  participant Real as 真实 libc
  App->>Libc: open("/data/data/com.target/x")
  Note over Libc: 入口已被 inline hook
  Libc->>IOU: 跳到 wrapper
  IOU->>SB: relocate_path
  SB-->>IOU: 替换为沙箱路径
  IOU->>Real: open(沙箱路径)
  Real-->>IOU: fd
  IOU-->>App: fd
```

详见 [虚拟存储与 IO 重定向](../../features/io-redirect) 与 [Native 层](../../features/native-layer)。
