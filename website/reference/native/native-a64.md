# native/A64Inlinehook · arm64 inline hook

::: tip 源码路径
[src/main/jni/A64Inlinehook/](https://github.com/android-security-engineer/VirtualXposed-skills/tree/vxp/VirtualApp/lib/src/main/jni/A64Inlinehook/)（`And64InlineHook.cpp` + `And64InlineHook.hpp`）
:::

arm64 专用的 inline hook 实现。处理 ARM64 指令集的 PC 相对寻址重定位——ARM64 的 `B`/`BL` 跳转范围有限（±128MB），inline hook 时要处理超出范围的跳转和被覆盖指令的重定位。

## 为什么 arm64 要单独一套

ARM64 与 x86_64 的指令长度、寻址方式差异巨大，无法共用一套 inline hook：

- ARM64 指令定长 4 字节，`B`/`BL` 跳转是 PC 相对、范围有限（±128MB）。
- inline hook 要在目标函数入口写跳转指令，被覆盖的原指令要重定位到跳板，PC 相对寻址的指令重定位后偏移会变。
- A64InlineHook 处理这些：构造跳板（trampoline）、重定位被覆盖指令、处理超出范围的远跳转。

## 与 Substrate 的关系

[`Substrate`](./native-substrate) 是 x86_64 的 inline hook 实现。两者**独立**，按 CPU 架构选用：

```mermaid
flowchart LR
  Q["目标函数所在架构?"] -->|"arm64"| A64["A64InlineHook"]
  Q -->|"x86_64"| Sub["Substrate StyleHook"]
  A64 --> Patch["改写 libc / ART 函数"]
  Sub --> Patch
```

## 调用方

- `IOUniformer` —— IO 重定向，hook libc 文件操作函数（`open`/`stat`/`access` …）。见 [IO 重定向](/features/io-redirect)。
- `VMPatch` —— hook ART 虚拟机相关函数。

两者在 arm64 上调用 And64InlineHook 改写目标函数入口。

## 关联

- [`Substrate`](./native-substrate)：x86_64 对应实现。
- [Native 层](/features/native-layer)：机制总览。
- [IO 重定向](/features/io-redirect)：主要使用场景。
