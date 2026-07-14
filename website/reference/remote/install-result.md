# InstallResult · 安装结果

::: tip 源码路径
[`src/main/java/com/lody/virtual/remote/InstallResult.java`](https://github.com/android-security-engineer/VirtualXposed-skills/blob/vxp/VirtualApp/lib/src/main/java/com/lody/virtual/remote/InstallResult.java)
:::

安装操作的结果（`Parcelable`）。`installPackage` 跨进程返回给调用方。

## 关键字段

- `boolean isSuccess` — 是否成功
- `boolean isUpdate` — 是否为更新
- `String error` — 失败原因
- `PackageSetting` — 成功后的包设置

## 用途

`VirtualCore.installPackage` 调 server `VAppManagerService.installPackage`，结果以 `InstallResult` 返回。

## 安装结果流

```mermaid
sequenceDiagram
  participant VC as VirtualCore (client)
  participant VAMS as VAppManagerService (server)
  participant IR as InstallResult
  VC->>VAMS: installPackage(asArgs, flags)
  VAMS->>VAMS: 解析 APK / 拷贝 / 落盘
  alt 成功
    VAMS->>IR: isSuccess=true, isUpdate=?, PackageSetting
  else 失败
    VAMS->>IR: isSuccess=false, error=原因
  end
  VAMS-->>VC: InstallResult (Parcelable)
  VC->>VC: 按 error 决定是否提示重装/冲突
```
