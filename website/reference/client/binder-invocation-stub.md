# BinderInvocationStub · 假 IBinder

::: tip 源码路径
[`src/main/java/com/lody/virtual/client/hook/base/BinderInvocationStub.java`](https://github.com/android-security-engineer/VirtualXposed-skills/blob/vxp/VirtualApp/lib/src/main/java/com/lody/virtual/client/hook/base/BinderInvocationStub.java)
:::

`BinderInvocationStub` 继承 [`MethodInvocationStub<IInterface>`](./method-invocation-stub) 并实现 `IBinder`。它是一个**假的 IBinder**——`queryLocalInterface` 返回带满 `MethodProxy` 的动态代理，从而让 `ServiceManager.getService(name)` 拿到的就是这个假 binder。45 个服务代理替换 `ServiceManager.sCache` 的物理基础就是它。

## 与父类的区别

`MethodInvocationStub` 包的是「接口调用」；`BinderInvocationStub` 多包了一层「binder 句柄」：

| 层 | 谁负责 | 干什么 |
| --- | --- | --- |
| IBinder | `BinderInvocationStub` | 实现 `transact`/`queryLocalInterface`，伪装成真 binder |
| IInterface | 父类 `MethodInvocationStub` | 动态代理按方法名分发到 `MethodProxy` |

## 构造方式

| 构造 | 用途 |
| --- | --- |
| `BinderInvocationStub(RefStaticMethod asInterfaceMethod, IBinder binder)` | 用 mirror 反射的 `asInterface` 把原 binder 转接口 |
| `BinderInvocationStub(Class<?> stubClass, IBinder binder)` | 用 `StubClass.asInterface` 反射转换 |
| `BinderInvocationStub(IInterface mBaseInterface)` | 已有接口直接包 |

## replaceService

```java
public void replaceService(String name)
```

把自己写进 `ServiceManager.sCache[name]`（或对应版本的缓存字段），此后所有 `Context.getSystemService` / `ServiceManager.getService` 拿到的都是这个假 binder。这是整个 hook 注入的「临门一脚」。

## 内嵌 AsBinder

`AsBinder` 是内部 `MethodProxy`，hook 的是 `asBinder()` 方法——当 App 通过接口取底层 binder 时，返回 `BinderInvocationStub` 自己，保持闭环。

## binder 替换闭环

```mermaid
flowchart LR
  APP["App getSystemService"] --> SM["ServiceManager.getService"]
  SM --> CACHE["sCache[name]"]
  CACHE --> BS["BinderInvocationStub<br/>(假 IBinder)"]
  BS -->|"queryLocalInterface"| PROXY["动态代理<br/>(挂满 MethodProxy)"]
  PROXY -->|"按方法名分发"| MP["各 MethodProxy"]
  PROXY -.->|"asBinder()"| BS
```

## 关联

- [`BinderInvocationProxy`](./method-invocation-proxy)：持有它并触发 `replaceService`。
- [`MethodInvocationStub`](./method-invocation-stub)：父类，提供分发能力。
- [系统服务 Hook](../../features/service-hook)：整体机制。
- [IPC 桥](../../features/ipc-bridge)：binder 替换的背景。
