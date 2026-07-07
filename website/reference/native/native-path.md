# native/Foundation/Path · 路径规范化

::: tip 源码路径
[`src/main/jni/Foundation/Path.cpp`](https://github.com/android-security-engineer/VirtualXposed-skills/blob/vxp/VirtualApp/lib/src/main/jni/Foundation/Path.cpp)
:::

路径规范化工具，71 行。提供基础的斜杠定位与路径规范化函数，被 [SandboxFs](./native-sandbox-fs) 与 [IOUniformer](./native-io-uniformer) 复用。

## 关键函数

从源码提取：

| 函数 | 作用 |
| --- | --- |
| `get_last_slash_pos(char *s)` | 返回路径中最后一个 `/` 的位置，用于切分目录与文件名 |
| `canonicalize_filename(const char *str)` | 规范化文件名：消除 `.`/`..`/重复斜杠，返回规范化后的路径 |

## 在重定向链中的位置

```mermaid
flowchart LR
  RAW["原始 path"] --> CAN["canonicalize_filename"]
  CAN --> SLASH["get_last_slash_pos<br/>切分 dir / name"]
  SLASH --> SF["SandboxFs.relocate_path"]
  SF --> OUT["重定向后的规范路径"]
```

规范化在前：先把 `.`/`..` 消除，再做替换表匹配，避免因路径写法不一致导致 keep/replace 表漏匹配。

`canonicalize_filename` 实现等价于 `realpath` 但不要求路径真实存在——这是关键，因为虚拟 App 请求的路径在沙箱里可能尚未创建，但重定向计算必须先于文件访问完成。
