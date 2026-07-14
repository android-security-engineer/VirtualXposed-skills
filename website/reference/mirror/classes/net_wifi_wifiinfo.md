# mirror · WifiInfo

::: tip 源码路径
[`src/main/java/mirror/android/net/wifi/WifiInfo.java`](https://github.com/android-security-engineer/VirtualXposed-skills/blob/vxp/VirtualApp/lib/src/main/java/mirror/android/net/wifi/WifiInfo.java)
:::

镜像真实类 `android.net.wifi.WifiInfo`，用 Ref 引用对象包装其隐藏成员。

## 镜像的字段/方法

  - public static RefConstructor&lt;android.net.wifi.WifiInfo&gt; ctor
  - public static RefObject&lt;String&gt; mMacAddress
  - public static RefObject&lt;SupplicantState&gt; mSupplicantState
  - public static RefObject&lt;InetAddress&gt; mIpAddress
  - public static RefObject&lt;Object&gt; mWifiSsid
  - public static RefObject&lt;String&gt; mBSSID
  - public static RefObject&lt;String&gt; mSSID

## 用途

配合 `RefClass.load` 在运行时绑定到真实 Android 类的对应成员，让 VirtualXposed 以类型安全方式访问这些隐藏 API。详见 [反射框架 mirror](/features/mirror-reflection) 与 [mirror 总览](/reference/mirror/).

## 镜像绑定与访问

```mermaid
flowchart LR
  SC["影子类<br/>mirror.WifiInfo"] -->|"RefClass.load"| BIND["绑定真实<br/>WifiInfo"]
  BIND --> USE["Ref*.get()/call()<br/>类型安全访问 @hide"]
```
