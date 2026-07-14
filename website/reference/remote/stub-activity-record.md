# StubActivityRecord · Stub Activity 记录

::: tip 源码路径
[`src/main/java/com/lody/virtual/remote/StubActivityRecord.java`](https://github.com/android-security-engineer/VirtualXposed-skills/blob/vxp/VirtualApp/lib/src/main/java/com/lody/virtual/remote/StubActivityRecord.java)
:::

Stub Activity 的还原记录（`Parcelable`）。承载"真实 Intent"在 Stub Intent 的 extras 里跨进程传递。详见 [Stub Activity](/features/stub-activity)。

## 关键字段

- `Intent intent` — 真实目标 Intent
- `ActivityInfo info` — 目标 Activity 信息
- `ComponentName caller` — 调用方
- `int userId` — 虚拟用户

另有 `saveToIntent(Intent stub)` / `fromIntent(Intent stub)` 在 Stub Intent 的 extras 里读写自身。

## 用途

虚拟 AMS 启动 Activity 时，把真实 Intent 包成 `StubActivityRecord` 塞进 Stub Intent 的 extras；客户端 `HCallbackStub` 在 `LAUNCH_ACTIVITY` 取出还原。

## 还原流程

```mermaid
sequenceDiagram
  participant App as 目标 App
  participant VAMS as VActivityManagerService
  participant Stub as Stub Intent (占位)
  participant HC as HCallbackStub
  participant Real as 真实 target Activity
  App->>VAMS: startActivity(target Intent)
  VAMS->>VAMS: new StubActivityRecord(intent, info, caller, userId)
  VAMS->>Stub: saveToIntent(stub) 塞进 extras
  Stub->>HC: LAUNCH_ACTIVITY 消息
  HC->>HC: StubActivityRecord.fromIntent(stub)
  HC->>Real: 还原真实 Intent + 启动 target
```

```mermaid
flowchart LR
  subgraph server
    VAMS["VAMS.startActivity"] --> SAR["StubActivityRecord<br/>(intent/info/caller/userId)"]
  end
  SAR -->|"saveToIntent"| EX["Stub Intent extras"]
  EX -->|"Parcelable 跨进程"| CLIENT["client 进程"]
  CLIENT --> HC["HCallbackStub<br/>LAUNCH_ACTIVITY"]
  HC --> RESTORE["还原真实 Activity"]
```
