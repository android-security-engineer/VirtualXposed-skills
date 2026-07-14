# Problem · 问题记录

::: tip 源码路径
[`src/main/java/com/lody/virtual/remote/Problem.java`](https://github.com/android-security-engineer/VirtualXposed-skills/blob/vxp/VirtualApp/lib/src/main/java/com/lody/virtual/remote/Problem.java)
:::

`Problem` 是问题/异常记录载体，实现 `Parcelable`。把 VirtualXposed 运行时遇到的兼容性问题以结构化形式跨进程传递，便于诊断。

## 字段

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `e` | `Throwable` | 触发的异常对象 |

## Parcel 实现

- `writeToParcel` 写出 `Throwable`（异常序列化）。
- 构造 `Problem(Throwable e)` 包装异常。

## 为什么需要它

server 进程里发生的异常（比如某个 hook 路径解析失败、binder 调用崩溃）需要被 client 端感知并上报/记录。直接抛 `RemoteException` 会丢失原始堆栈，`Problem` 把整个 `Throwable` 序列化跨进程传回，保留完整调用栈。

## 用途

异步安装、组件调度等可能失败的跨进程操作，返回结果里附 `Problem` 描述失败原因，UI 层可展示给用户或写入 [`VLog`](../helper/utils/vlog)。

## 异常跨进程传递

```mermaid
flowchart LR
  SRV["server 进程<br/>hook 解析失败/binder 崩溃"] --> CATCH["catch Throwable"]
  CATCH --> P["Problem(e)<br/>序列化完整堆栈"]
  P -->|"Parcelable 跨进程"| CLIENT["client 进程"]
  CLIENT --> UI["UI 展示 / VLog 记录"]
```

直接抛 `RemoteException` 会丢失原始堆栈，`Problem` 把整个 `Throwable` 序列化跨进程传回，保留完整调用栈。

## 关联

- [`VLog`](../helper/utils/vlog)：日志记录。
- [`VAppManagerService`](../server/pm)：安装结果反馈。
