# mirror · NotificationM

::: tip 源码路径
[`src/main/java/mirror/android/app/NotificationM.java`](https://github.com/android-security-engineer/VirtualXposed-skills/blob/vxp/VirtualApp/lib/src/main/java/mirror/android/app/NotificationM.java)
:::

镜像真实类 `android.app.NotificationM`，用 Ref 引用对象包装其隐藏成员。

## 镜像的字段/方法

  - public static RefObject&lt;Icon&gt; mLargeIcon
  - public static RefObject&lt;Icon&gt; mSmallIcon

## 用途

配合 `RefClass.load` 在运行时绑定到真实 Android 类的对应成员，让 VirtualXposed 以类型安全方式访问这些隐藏 API。详见 [反射框架 mirror](/features/mirror-reflection) 与 [mirror 总览](/reference/mirror/).

## 镜像绑定与访问

```mermaid
flowchart LR
  SC["影子类<br/>mirror.NotificationM"] -->|"RefClass.load"| BIND["绑定真实<br/>NotificationM"]
  BIND --> USE["Ref*.get()/call()<br/>类型安全访问 @hide"]
```
