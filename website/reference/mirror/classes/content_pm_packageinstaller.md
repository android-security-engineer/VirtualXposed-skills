# mirror · PackageInstaller

::: tip 源码路径
[`src/main/java/mirror/android/content/pm/PackageInstaller.java`](https://github.com/android-security-engineer/VirtualXposed-skills/blob/vxp/VirtualApp/lib/src/main/java/mirror/android/content/pm/PackageInstaller.java)
:::

镜像真实类 `android.content.pm.PackageInstaller$SessionInfo`，用 Ref 引用对象包装其隐藏成员。

## 镜像的字段/方法

  - public static RefObject&lt;Bitmap&gt; appIcon
  - public static RefObject&lt;CharSequence&gt; appLabel
  - public static RefObject&lt;String&gt; appPackageName
  - public static RefConstructor&lt;android.content.pm.PackageInstaller.SessionInfo&gt; ctor
  - public static RefObject&lt;String&gt; installerPackageName
  - public static RefObject&lt;String&gt; resolvedBaseCodePath
  - public static RefObject&lt;String&gt; abiOverride
  - public static RefObject&lt;Bitmap&gt; appIcon
  - public static RefObject&lt;String&gt; appLabel
  - public static RefObject&lt;String&gt; appPackageName
  - public static RefObject&lt;Uri&gt; originatingUri
  - public static RefObject&lt;Uri&gt; referrerUri
  - public static RefObject&lt;String&gt; abiOverride
  - public static RefObject&lt;Bitmap&gt; appIcon
  - public static RefObject&lt;String&gt; appLabel
  - public static RefObject&lt;String&gt; appPackageName
  - public static RefObject&lt;String[]&gt; grantedRuntimePermissions
  - public static RefObject&lt;Uri&gt; originatingUri
  - public static RefObject&lt;Uri&gt; referrerUri
  - public static RefObject&lt;String&gt; volumeUuid

## 用途

配合 `RefClass.load` 在运行时绑定到真实 Android 类的对应成员，让 VirtualXposed 以类型安全方式访问这些隐藏 API。详见 [反射框架 mirror](/features/mirror-reflection) 与 [mirror 总览](/reference/mirror/).

## 镜像绑定与访问

```mermaid
flowchart LR
  SC["影子类<br/>mirror.PackageInstaller"] -->|"RefClass.load"| BIND["绑定真实<br/>PackageInstaller"]
  BIND --> USE["Ref*.get()/call()<br/>类型安全访问 @hide"]
```
