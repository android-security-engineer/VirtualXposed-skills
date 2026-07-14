# mirror · ParceledListSliceJBMR2

::: tip 源码路径
[`src/main/java/mirror/android/content/pm/ParceledListSliceJBMR2.java`](https://github.com/android-security-engineer/VirtualXposed-skills/blob/vxp/VirtualApp/lib/src/main/java/mirror/android/content/pm/ParceledListSliceJBMR2.java)
:::

镜像真实类 `android.content.pm.ParceledListSlice`，用 Ref 引用对象包装其隐藏成员。

## 镜像的字段/方法

  - public static RefStaticObject&lt;Parcelable.Creator&gt; CREATOR
  - public static RefConstructor&lt;Parcelable&gt; ctor
  - public static RefMethod&lt;List&gt; getList

## 用途

配合 `RefClass.load` 在运行时绑定到真实 Android 类的对应成员，让 VirtualXposed 以类型安全方式访问这些隐藏 API。详见 [反射框架 mirror](/features/mirror-reflection) 与 [mirror 总览](/reference/mirror/).


## 真实类与使用方

镜像的真实类为 `android.content.pm.ParceledListSlice`（@hide 隐藏 API），被以下模块引用：

| 使用方 | 模块 |
| --- | --- |
| `shortcut/ShortcutServiceStub.java` | [shortcut 代理](/reference/proxies/shortcut) |
| `pm/MethodProxies.java` | [pm 代理](/reference/proxies/pm) |
| `am/ActivityManagerStub.java` | [am 代理](/reference/proxies/am) |
## 镜像绑定与访问

```mermaid
flowchart LR
  SC["影子类<br/>mirror.ParceledListSliceJBMR2"] -->|"RefClass.load"| BIND["绑定真实<br/>ParceledListSliceJBMR2"]
  BIND --> USE["Ref*.get()/call()<br/>类型安全访问 @hide"]
```
