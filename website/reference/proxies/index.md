# 服务代理 proxies

::: tip 源码路径
[`src/main/java/com/lody/virtual/client/hook/proxies/`](https://github.com/android-security-engineer/VirtualXposed-skills/tree/vxp/VirtualApp/lib/src/main/java/com/lody/virtual/client/hook/proxies)
:::

VirtualXposed 在客户端（虚拟 App 进程）用 **45 个服务代理**拦截目标 App 对系统服务的调用。每个代理对应一个 Android 系统服务，把目标 App 的请求重定向到 VirtualXposed 自己的虚拟服务或就地改写参数。

## 统一模式

所有代理都遵循同一套套路（详见 [系统服务 Hook](../../features/service-hook)）：

```mermaid
flowchart LR
  T["目标 App"] -->|"Context.getSystemService"| SM["ServiceManager.sCache<br/>(已被替换)"]
  SM --> PROXY["动态代理 IBinder<br/>queryLocalInterface"]
  PROXY --> STUB["XxxStub<br/>(BinderInvocationProxy)"]
  STUB -->|"按方法名分发"| MP["MethodProxy 列表<br/>getPassword/getAccounts..."]
  MP -->|"改写参数/转发"| VS["虚拟服务<br/>(VAccountManager 等)<br/>或真实系统"]
```

每个代理目录下的文件角色固定：

| 文件 | 作用 |
| --- | --- |
| `XxxStub.java` | 代理入口，继承 `BinderInvocationProxy`，构造时指定 service 名，`onBindMethods` 注册 MethodProxy |
| `MethodProxies.java` | 用 `@Inject` 注解批量定义的内部类 MethodProxy 集合（大代理才有） |
| 辅助类 | 如 location 的 `MockLocationHelper`、`GPSListenerThread` |

## 45 个代理一览

| 代理 | 拦截服务 | MethodProxy 数 | 文档 |
| --- | --- | --- | --- |
| account | ACCOUNT_SERVICE | ~30 | [账户](./account) |
| alarm | ALARM_SERVICE | — | [闹钟](./alarm) |
| am | activity | 12 | [活动管理](./am) |
| appops | APP_OPS_SERVICE | — | [应用操作](./appops) |
| appwidget | APPWIDGET_SERVICE | — | [桌面小部件](./appwidget) |
| audio | AUDIO_SERVICE | — | [音频](./audio) |
| backup | backup | — | [备份](./backup) |
| battery | batterystats | — | [电池统计](./battery) |
| bluetooth | bluetooth | — | [蓝牙](./bluetooth) |
| clipboard | CLIPBOARD_SERVICE | — | [剪贴板](./clipboard) |
| connectivity | CONNECTIVITY_SERVICE | — | [网络连接](./connectivity) |
| content | content | — | [内容服务](./content) |
| context_hub | contexthub | — | [上下文中心](./context_hub) |
| devicepolicy | DEVICE_POLICY_SERVICE | — | [设备策略](./devicepolicy) |
| display | display | — | [显示](./display) |
| dropbox | DROPBOX_SERVICE | — | [DropBox](./dropbox) |
| fingerprint | FINGERPRINT_SERVICE | — | [指纹](./fingerprint) |
| graphics | graphicsstats | — | [图形统计](./graphics) |
| imms | imms | — | [彩信](./imms) |
| input | INPUT_METHOD_SERVICE | — | [输入法](./input) |
| isms | isms | — | [短信](./isms) |
| isub | isub | — | [订阅](./isub) |
| job | JOB_SCHEDULER_SERVICE | — | [作业调度](./job) |
| libcore | chown 等 | 5 | [LibCore](./libcore) |
| location | LOCATION_SERVICE | 17 | [定位](./location) |
| media | — | — | [媒体](./media) |
| mount | mount | — | [挂载](./mount) |
| network | network | — | [网络管理](./network) |
| notification | notification | 16 | [通知](./notification) |
| os | unknown | — | [设备标识](./os) |
| persistent_data_block | write | — | [持久数据块](./persistent_data_block) |
| phonesubinfo | iphonesubinfo | 18 | [电话子信息](./phonesubinfo) |
| pm | LAUNCHER_APPS_SERVICE | 28 | [包管理](./pm) |
| power | POWER_SERVICE | — | [电源](./power) |
| restriction | RESTRICTIONS_SERVICE | — | [限制](./restriction) |
| search | SEARCH_SERVICE | — | [搜索](./search) |
| shortcut | shortcut | — | [快捷方式](./shortcut) |
| telephony | listen 等 | 33 | [电话](./telephony) |
| usage | USAGE_STATS_SERVICE | — | [使用统计](./usage) |
| user | USER_SERVICE | — | [用户](./user) |
| vibrator | VIBRATOR_SERVICE | — | [振动](./vibrator) |
| view | autofill | — | [视图](./view) |
| wifi | WIFI_SERVICE | — | [WiFi](./wifi) |
| wifi_scanner | wifiscanner | — | [WiFi 扫描](./wifi_scanner) |
| window | WINDOW_SERVICE | 2 | [窗口](./window) |

> 💡 "—" 表示该代理主要靠基类 `BinderInvocationProxy` 的默认行为或单一泛化 MethodProxy（如 `ReplaceCallingPkgMethodProxy`），无需逐个定义 MethodProxy。
