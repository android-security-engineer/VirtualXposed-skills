# mirror · Settings

::: tip 源码路径
[`src/main/java/mirror/android/providers/Settings.java`](https://github.com/android-security-engineer/VirtualXposed-skills/blob/vxp/VirtualApp/lib/src/main/java/mirror/android/providers/Settings.java)
:::

镜像真实类 `android.provider.Settings$NameValueCache`，用 Ref 引用对象包装其隐藏成员。

## 镜像的字段/方法

  - public static RefStaticObject&lt;Object&gt; sNameValueCache
  - public static RefObject&lt;Object&gt; mContentProvider
  - public static RefObject&lt;Object&gt; mProviderHolder
  - public static RefObject&lt;IInterface&gt; mContentProvider
  - public static RefStaticObject&lt;Object&gt; sNameValueCache
  - public static RefStaticObject&lt;Object&gt; sNameValueCache

## 用途

配合 `RefClass.load` 在运行时绑定到真实 Android 类的对应成员，让 VirtualXposed 以类型安全方式访问这些隐藏 API。详见 [反射框架 mirror](/features/mirror-reflection) 与 [mirror 总览](/reference/mirror/).

## 镜像绑定与访问

```mermaid
flowchart LR
  SC["影子类<br/>mirror.Settings"] -->|"RefClass.load"| BIND["绑定真实<br/>Settings"]
  BIND --> USE["Ref*.get()/call()<br/>类型安全访问 @hide"]
```
