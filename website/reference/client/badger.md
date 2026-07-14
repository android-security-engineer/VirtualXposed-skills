# client/badger · 角标支持

::: tip 源码路径
[`src/main/java/com/lody/virtual/client/badger/`](https://github.com/android-security-engineer/VirtualXposed-skills/tree/vxp/VirtualApp/lib/src/main/java/com/lody/virtual/client/badger)
:::

桌面图标角标（Badge）支持，共 4 个文件。让虚拟 App 的未读消息角标能正确显示在不同厂商桌面上。各厂商（华为/小米/三星/OPPO/LG 等）角标实现各异且走不同广播/Provider，`badger/` 适配多种角标协议，把虚拟 App 的角标更新转发到真实桌面。

## 文件清单

| 文件 | 角色 |
| --- | --- |
| `IBadger` | 角标协议接口，定义 `getAction()` 等 |
| `BadgerManager` | 总管理器，按广播 action 路由到对应 `IBadger` |
| `BroadcastBadger1` | 基于广播的角标基类（第一组厂商实现） |
| `BroadcastBadger2` | 基于广播的角标基类（第二组厂商实现） |

## IBadger 接口

`IBadger` 抽象一个厂商角标协议，核心方法 `getAction()` 返回该厂商监听的广播 action。`BroadcastBadger1`/`BroadcastBadger2` 是它的两个抽象实现，各自内部用静态内部类挂多个具体厂商：

- `BroadcastBadger1`：`LGHomeBadger`、`AdwHomeBadger`、`AospHomeBadger`、`NewHtcHomeBadger2`、`OPPOHomeBader` …
- `BroadcastBadger2`：`NewHtcHomeBadger1` …

## BadgerManager

```java
public class BadgerManager {
    private static final Map<String, IBadger> BADGERS = new HashMap<>(10);
    public static boolean handleBadger(Intent intent) { ... }
}
```

- 静态块里 `addBadger` 注册所有厂商实现，以 `action` 为键。
- `handleBadger(Intent)` 收到角标广播时按 action 查表分发给对应 `IBadger` 处理。

## 工作流

```mermaid
flowchart LR
  APP["虚拟 App 触发角标"] --> SRV["server"]
  SRV -->|"BadgerInfo 跨进程"| CLI["client"]
  CLI --> BM["BadgerManager.handleBadger"]
  BM --> OS["OSUtils 判 ROM"]
  OS -->|"action 查表"| BG["对应 IBadger 厂商实现"]
  BG -->|"广播/Provider"| LAUNCH["真实桌面 Launcher"]
```

1. 虚拟 App 触发未读角标 → server 打包 [`BadgerInfo`](../remote/badger-info) 跨进程传给 client。
2. client `BadgerManager.handleBadger` 按当前 ROM（[`OSUtils`](../helper/utils/os-utils)）选协议。
3. 对应 `IBadger` 构造厂商专属广播/Provider 调用，转发到真实桌面 Launcher。

## 关联

- [`BadgerInfo`](../remote/badger-info)：跨进程角标数据。
- [`OSUtils`](../helper/utils/os-utils)：厂商 ROM 判定。
