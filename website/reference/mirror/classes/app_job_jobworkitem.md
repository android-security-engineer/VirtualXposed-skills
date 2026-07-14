# mirror · JobWorkItem

::: tip 源码路径
[`src/main/java/mirror/android/app/job/JobWorkItem.java`](https://github.com/android-security-engineer/VirtualXposed-skills/blob/vxp/VirtualApp/lib/src/main/java/mirror/android/app/job/JobWorkItem.java)
:::

镜像真实类 `android.app.job.JobWorkItem`，用 Ref 引用对象包装其隐藏成员。

## 镜像的字段/方法

  - public static RefConstructor&lt;android.app.job.JobWorkItem&gt; ctor
  - public static RefObject&lt;Intent&gt; mIntent
  - public static RefObject&lt;Integer&gt; mDeliveryCount
  - public static RefObject&lt;Integer&gt; mWorkId
  - public static RefObject&lt;Object&gt; mGrants
  - public static RefMethod&lt;Intent&gt; getIntent

## 用途

配合 `RefClass.load` 在运行时绑定到真实 Android 类的对应成员，让 VirtualXposed 以类型安全方式访问这些隐藏 API。详见 [反射框架 mirror](/features/mirror-reflection) 与 [mirror 总览](/reference/mirror/).

## 镜像绑定与访问

```mermaid
flowchart LR
  SC["影子类<br/>mirror.JobWorkItem"] -->|"RefClass.load"| BIND["绑定真实<br/>JobWorkItem"]
  BIND --> USE["Ref*.get()/call()<br/>类型安全访问 @hide"]
```
