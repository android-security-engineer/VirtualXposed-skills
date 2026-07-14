# VirtualXposed Skill 查询手册

本手册是 skill 的速查附录，数据从源码与 `reference/index.md` 真实抽取。

## 1. 关键认知：VirtualXposed 不是 SDK

VirtualXposed 是 Xposed 模块的**运行容器**。它自身**不提供** `IXposedHookLoadPackage`、`XposedHelpers`、`XposedBridge` 等开发入口供你调用——这些是你在模块里 import 的 Xposed API，VirtualXposed 负责在免 Root 环境让它们生效。
查源码已确认：`VirtualApp/lib/src` 中无任何 Xposed API 定义文件。

因此本 skill 的"工具 C"只引导写标准 Xposed 模块，不生成 VirtualXposed 专属代码。

## 2. 六大源码模块速查

| 模块 | 源码路径 | 文档 | 职责 |
|------|---------|------|------|
| 服务代理 | client/hook/proxies/ | /reference/proxies/ | 48 个系统服务客户端 Hook 注入 |
| 虚拟服务 | server/ | /reference/server/ | server 进程重实现的系统服务 |
| 客户端基建 | client/ | /reference/client/ | Hook 框架/IPC/Stub/修复器 |
| 反射镜像 | mirror/ | /reference/mirror/ | 144 影子类包装隐藏 API |
| 工具数据 | helper/ · remote/ | /reference/helper/ /reference/remote/ | 兼容工具/集合/跨进程数据类 |
| Native 层 | jni/ | /reference/native/ | libc hook/ART hook/inline hook |

`llms-index.json` 实际索引 239 个核心 Java 类（lib/src 下含 public 声明的类），分布：client(76) + proxies(57) + helper(40) + server(43) + remote(15) + os(5) + 顶层杂项(3)。

## 3. 48 个系统服务代理（部分，完整表见 /reference/proxies/）

| 代理 | 拦截服务 | 典型用途 |
|------|---------|---------|
| account | ACCOUNT_SERVICE | 虚拟账户 |
| am | activity | 活动管理路由 |
| appops | APP_OPS_SERVICE | 应用操作权限 |
| clipboard | CLIPBOARD_SERVICE | 剪贴板隔离 |
| connectivity | CONNECTIVITY_SERVICE | 网络状态伪造 |
| devicepolicy | DEVICE_POLICY_SERVICE | 设备策略 |
| fingerprint | FINGERPRINT_SERVICE | 指纹 |
| location | location | 虚拟定位 |
| notification | notification | 通知隔离 |
| pm | package | 虚拟包管理 |
| telephony | telephony | 电话信息伪造 |
| wifi | wifi | 虚拟 WiFi |

## 4. Hook 框架基类链

MethodProxy → (Replace*MethodProxy | StaticMethodProxy | ResultStaticMethodProxy)
→ MethodInvocationStub(分发器) → MethodInvocationProxy(注入器)
→ BinderInvocationProxy(binder 注入)。
注册：@Inject / @SkipInject 注解，InvocationStubManager 统一管理。

## 5. 查询示例

- "VLocation 在哪" → llms-index.json 过滤 className=VLocation → remote 模块
- "怎么 Hook 剪贴板" → 工具 B：proxies/clipboard + server + 全文第 4.2 节
- "写个虚拟定位模块" → 工具 C：标准 Xposed 模块 + 两大限制提醒

## 6. 预编译 APK 下载速查

VirtualXposed 以 APK 分发，Agent 可直接下载无需编译：

| 需求 | 命令/URL |
|------|---------|
| 下载最新 APK | `gh release download --repo android-security-engineer/VirtualXposed-skills --pattern '*.apk'` |
| latest release 页面 | https://github.com/android-security-engineer/VirtualXposed-skills/releases/latest |
| 源码编译文档 | /dev/build（jcenter 阿里云镜像 + NDK r19c + keystore 配置） |
| CI 构建流水线 | .github/workflows/android.yml（构建）+ release.yml（tag 触发发布） |

APK 已签名，arm64-v8a / x86_64，Android 5.0~10.0。versionName 0.22.0 / versionCode 220。
