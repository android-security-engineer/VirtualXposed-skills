# mirror · NetworkInfo

::: tip 源码路径
[`src/main/java/mirror/android/net/NetworkInfo.java`](https://github.com/android-security-engineer/VirtualXposed-skills/blob/vxp/VirtualApp/lib/src/main/java/mirror/android/net/NetworkInfo.java)
:::

镜像真实类 `android.net.NetworkInfo`，用 Ref 引用对象包装其隐藏成员。

## 镜像的字段/方法

  - public static RefConstructor&lt;android.net.NetworkInfo&gt; ctor
  - public static RefConstructor&lt;android.net.NetworkInfo&gt; ctorOld
  - public static RefObject&lt;String&gt; mTypeName
  - public static RefObject&lt;android.net.NetworkInfo.State&gt; mState
  - public static RefObject&lt;android.net.NetworkInfo.DetailedState&gt; mDetailedState

## 用途

配合 `RefClass.load` 在运行时绑定到真实 Android 类的对应成员，让 VirtualXposed 以类型安全方式访问这些隐藏 API。详见 [反射框架 mirror](/features/mirror-reflection) 与 [mirror 总览](/reference/mirror/).

## 镜像绑定与访问

```mermaid
flowchart LR
  SC["影子类<br/>mirror.NetworkInfo"] -->|"RefClass.load"| BIND["绑定真实<br/>NetworkInfo"]
  BIND --> USE["Ref*.get()/call()<br/>类型安全访问 @hide"]
```
