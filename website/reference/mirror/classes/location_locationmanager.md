# mirror · LocationManager

::: tip 源码路径
[`src/main/java/mirror/android/location/LocationManager.java`](https://github.com/android-security-engineer/VirtualXposed-skills/blob/vxp/VirtualApp/lib/src/main/java/mirror/android/location/LocationManager.java)
:::

镜像真实类 `android.location.LocationManager`，用 Ref 引用对象包装其隐藏成员。

## 镜像的字段/方法

  - public static RefObject&lt;HashMap&gt; mGnssNmeaListeners
  - public static RefObject&lt;HashMap&gt; mGnssStatusListeners
  - public static RefObject&lt;HashMap&gt; mGpsNmeaListeners
  - public static RefObject&lt;HashMap&gt; mGpsStatusListeners
  - public static RefObject&lt;HashMap&gt; mListeners
  - public static RefObject&lt;HashMap&gt; mNmeaListeners
  - public static RefObject&lt;Object&gt; mGpsListener
  - public static RefObject&lt;Object&gt; mGpsNmeaListener
  - public static RefMethod&lt;Void&gt; onFirstFix
  - public static RefMethod&lt;Void&gt; onGnssStarted
  - public static RefMethod&lt;Void&gt; onNmeaReceived
  - public static RefMethod&lt;Void&gt; onSvStatusChanged
  - public static RefObject&lt;Object&gt; this
  - public static RefObject&lt;Object&gt; mListener
  - public static RefObject&lt;Object&gt; mNmeaListener
  - public static RefMethod&lt;Void&gt; onFirstFix
  - public static RefMethod&lt;Void&gt; onGpsStarted
  - public static RefMethod&lt;Void&gt; onNmeaReceived
  - public static RefMethod&lt;Void&gt; onSvStatusChanged
  - public static RefObject&lt;Object&gt; this
  - public static RefMethod&lt;Void&gt; onSvStatusChanged
  - public static RefMethod&lt;Void&gt; onSvStatusChanged
  - public static RefMethod&lt;Void&gt; onSvStatusChanged
  - public static RefObject&lt;LocationListener&gt; mListener
  - public static RefMethod&lt;Void&gt; onLocationChanged

## 用途

配合 `RefClass.load` 在运行时绑定到真实 Android 类的对应成员，让 VirtualXposed 以类型安全方式访问这些隐藏 API。详见 [反射框架 mirror](/features/mirror-reflection) 与 [mirror 总览](/reference/mirror/).


## 真实类与使用方

镜像的真实类为 `android.location.LocationManager`（@hide 隐藏 API），被以下模块引用：

| 使用方 | 模块 |
| --- | --- |
| `location/GPSListenerThread.java` | [location 代理](/reference/proxies/location) |
| `location/MethodProxies.java` | [location 代理](/reference/proxies/location) |
| `location/MockLocationHelper.java` | [location 代理](/reference/proxies/location) |
## 镜像绑定与访问

```mermaid
flowchart LR
  SC["影子类<br/>mirror.LocationManager"] -->|"RefClass.load"| BIND["绑定真实<br/>LocationManager"]
  BIND --> USE["Ref*.get()/call()<br/>类型安全访问 @hide"]
```
