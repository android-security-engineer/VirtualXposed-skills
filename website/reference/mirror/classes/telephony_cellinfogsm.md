# mirror · CellInfoGsm

::: tip 源码路径
[`src/main/java/mirror/android/telephony/CellInfoGsm.java`](https://github.com/android-security-engineer/VirtualXposed-skills/blob/vxp/VirtualApp/lib/src/main/java/mirror/android/telephony/CellInfoGsm.java)
:::

镜像真实类 `android.telephony.CellInfoGsm`，用 Ref 引用对象包装其隐藏成员。

## 镜像的字段/方法

  - public static RefConstructor&lt;android.telephony.CellInfoGsm&gt; ctor
  - public static RefObject&lt;android.telephony.CellIdentityGsm&gt; mCellIdentityGsm
  - public static RefObject&lt;android.telephony.CellSignalStrengthGsm&gt; mCellSignalStrengthGsm

## 用途

配合 `RefClass.load` 在运行时绑定到真实 Android 类的对应成员，让 VirtualXposed 以类型安全方式访问这些隐藏 API。详见 [反射框架 mirror](/features/mirror-reflection) 与 [mirror 总览](/reference/mirror/).

## 镜像绑定与访问

```mermaid
flowchart LR
  SC["影子类<br/>mirror.CellInfoGsm"] -->|"RefClass.load"| BIND["绑定真实<br/>CellInfoGsm"]
  BIND --> USE["Ref*.get()/call()<br/>类型安全访问 @hide"]
```
