import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// 仓库名为 VirtualXposed-skills，GitHub Pages 项目站点 base 路径为 /VirtualXposed-skills/
export default withMermaid(
  defineConfig({
  lang: 'zh-CN',
  title: 'VirtualXposed',
  description: '免 Root 运行 Xposed 模块的 Android 虚拟化实现 —— 原理与源码解析教学站',
  base: '/VirtualXposed-skills/',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['meta', { name: 'theme-color', content: '#41b883' }],
    ['meta', { property: 'og:title', content: 'VirtualXposed 原理详解' }],
    ['meta', { property: 'og:description', content: '基于 VirtualApp + epic，在免 Root 环境下运行 Xposed 模块的实现解析' }]
  ],

  themeConfig: {
    siteTitle: 'VirtualXposed 原理详解',
    logo: '/logo.svg',

    nav: [
      { text: '首页', link: '/' },
      {
        text: '入门',
        link: '/guide/what-is-virtualxposed',
        activeMatch: '/guide/'
      },
      {
        text: '架构原理',
        link: '/architecture/overview',
        activeMatch: '/architecture/'
      },
      {
        text: '功能详解',
        link: '/features/app-virtualization',
        activeMatch: '/features/'
      },
      {
        text: 'Xposed 集成',
        link: '/xposed/how-it-works',
        activeMatch: '/xposed/'
      },
      {
        text: '源码参考',
        link: '/reference/',
        activeMatch: '/reference/'
      },
      { text: 'GitHub', link: 'https://github.com/android-security-engineer/VirtualXposed-skills' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '入门',
          items: [
            { text: '这是什么', link: '/guide/what-is-virtualxposed' },
            { text: '它解决了什么问题', link: '/guide/problem-and-solution' },
            { text: '快速使用', link: '/guide/quick-start' },
            { text: '能力边界与限制', link: '/guide/limitations' }
          ]
        }
      ],
      '/architecture/': [
        {
          text: '架构总览',
          items: [
            { text: '整体架构', link: '/architecture/overview' },
            { text: '进程模型', link: '/architecture/process-model' },
            { text: '模块组成', link: '/architecture/modules' }
          ]
        }
      ],
      '/features/': [
        {
          text: '核心机制',
          items: [
            { text: '应用虚拟化', link: '/features/app-virtualization' },
            { text: '系统服务 Hook', link: '/features/service-hook' },
            { text: 'Stub Activity 机制', link: '/features/stub-activity' },
            { text: '跨进程 IPC 桥', link: '/features/ipc-bridge' }
          ]
        },
        {
          text: '虚拟服务',
          items: [
            { text: '包管理 (PMS)', link: '/features/package-manager' },
            { text: '活动管理 (AMS)', link: '/features/activity-manager' },
            { text: '虚拟定位', link: '/features/virtual-location' },
            { text: '设备信息伪造', link: '/features/device-spoofing' },
            { text: '虚拟存储与 IO 重定向', link: '/features/io-redirect' }
          ]
        },
        {
          text: '底层支撑',
          items: [
            { text: '反射框架 mirror', link: '/features/mirror-reflection' },
            { text: 'Native 层 (JNI/Inline Hook)', link: '/features/native-layer' }
          ]
        }
      ],
      '/xposed/': [
        {
          text: 'Xposed 集成',
          items: [
            { text: '免 Root Hook 原理', link: '/xposed/how-it-works' },
            { text: '模块加载流程', link: '/xposed/module-loading' },
            { text: 'epic 与 ExposedBridge', link: '/xposed/epic-exposed' },
            { text: '为何不支持资源 Hook', link: '/xposed/resource-hook-limit' }
          ]
        }
      ],
      '/dev/': [
        {
          text: '构建与部署',
          items: [
            { text: '本地构建', link: '/dev/build' },
            { text: '本文档站搭建', link: '/dev/docs-site' }
          ]
        },
        {
          text: 'AI Agent 对接',
          items: [
            { text: 'Agent 对接说明', link: '/dev/for-agents' }
          ]
        }
      ],
      '/reference/': [
        {
          text: '源码参考',
          items: [
            { text: '总索引', link: '/reference/' }
          ]
        },
        {
          text: '🔌 服务代理 (48)',
          collapsed: true,
          items: [
            { text: '总览', link: '/reference/proxies/' },
            { text: 'account 账户', link: '/reference/proxies/account' },
            { text: 'alarm 闹钟', link: '/reference/proxies/alarm' },
            { text: 'am 活动管理', link: '/reference/proxies/am' },
            { text: 'appops 应用操作', link: '/reference/proxies/appops' },
            { text: 'appwidget 小部件', link: '/reference/proxies/appwidget' },
            { text: 'audio 音频', link: '/reference/proxies/audio' },
            { text: 'backup 备份', link: '/reference/proxies/backup' },
            { text: 'battery 电池统计', link: '/reference/proxies/battery' },
            { text: 'bluetooth 蓝牙', link: '/reference/proxies/bluetooth' },
            { text: 'clipboard 剪贴板', link: '/reference/proxies/clipboard' },
            { text: 'connectivity 网络连接', link: '/reference/proxies/connectivity' },
            { text: 'content 内容服务', link: '/reference/proxies/content' },
            { text: 'context_hub 上下文中心', link: '/reference/proxies/context_hub' },
            { text: 'devicepolicy 设备策略', link: '/reference/proxies/devicepolicy' },
            { text: 'display 显示', link: '/reference/proxies/display' },
            { text: 'dropbox DropBox', link: '/reference/proxies/dropbox' },
            { text: 'fingerprint 指纹', link: '/reference/proxies/fingerprint' },
            { text: 'graphics 图形统计', link: '/reference/proxies/graphics' },
            { text: 'imms 彩信', link: '/reference/proxies/imms' },
            { text: 'input 输入法', link: '/reference/proxies/input' },
            { text: 'isms 短信', link: '/reference/proxies/isms' },
            { text: 'isub 订阅', link: '/reference/proxies/isub' },
            { text: 'job 作业调度', link: '/reference/proxies/job' },
            { text: 'libcore LibCore', link: '/reference/proxies/libcore' },
            { text: 'location 定位', link: '/reference/proxies/location' },
            { text: 'media 媒体', link: '/reference/proxies/media' },
            { text: 'mount 挂载', link: '/reference/proxies/mount' },
            { text: 'network 网络管理', link: '/reference/proxies/network' },
            { text: 'notification 通知', link: '/reference/proxies/notification' },
            { text: 'os 设备标识', link: '/reference/proxies/os' },
            { text: 'persistent_data_block 持久数据块', link: '/reference/proxies/persistent_data_block' },
            { text: 'phonesubinfo 电话子信息', link: '/reference/proxies/phonesubinfo' },
            { text: 'pm 包管理', link: '/reference/proxies/pm' },
            { text: 'power 电源', link: '/reference/proxies/power' },
            { text: 'restriction 限制', link: '/reference/proxies/restriction' },
            { text: 'search 搜索', link: '/reference/proxies/search' },
            { text: 'shortcut 快捷方式', link: '/reference/proxies/shortcut' },
            { text: 'telephony 电话', link: '/reference/proxies/telephony' },
            { text: 'usage 使用统计', link: '/reference/proxies/usage' },
            { text: 'user 用户', link: '/reference/proxies/user' },
            { text: 'vibrator 振动', link: '/reference/proxies/vibrator' },
            { text: 'view 视图', link: '/reference/proxies/view' },
            { text: 'wifi WiFi', link: '/reference/proxies/wifi' },
            { text: 'wifi_scanner WiFi扫描', link: '/reference/proxies/wifi_scanner' },
            { text: 'window 窗口', link: '/reference/proxies/window' }
          ]
        },
        {
          text: '🖥️ 虚拟服务 (server)',
          collapsed: true,
          items: [
            { text: '总览', link: '/reference/server/' },
            { text: 'am 活动管理服务', link: '/reference/server/am' },
            { text: 'am 数据结构类', link: '/reference/server/am-classes/' },
            { text: 'pm 包管理服务', link: '/reference/server/pm' },
            { text: 'pm 安装器 installer', link: '/reference/server/pm-installer' },
            { text: 'accounts 账户服务', link: '/reference/server/accounts' },
            { text: 'job 作业调度服务', link: '/reference/server/job' },
            { text: 'location 虚拟定位服务', link: '/reference/server/location' },
            { text: 'notification 通知服务', link: '/reference/server/notification' },
            { text: 'device 设备信息服务', link: '/reference/server/device' },
            { text: 'vs 虚拟存储服务', link: '/reference/server/vs' },
            { text: 'secondary 次级服务', link: '/reference/server/secondary' },
            { text: 'ipc IPC 基建', link: '/reference/server/ipc' }
          ]
        },
        {
          text: '⚙️ 客户端基建 (client)',
          collapsed: true,
          items: [
            { text: '总览', link: '/reference/client/' },
            { text: 'VClientImpl 客户端核心', link: '/reference/client/vclient' },
            { text: 'NativeEngine Native桥', link: '/reference/client/native-engine' },
            { text: 'core 引擎核心', link: '/reference/client/core', items: [
              { text: 'InvocationStubManager 代理注册器', link: '/reference/client/invocation-stub-manager' }
            ] },
            { text: 'hook/base Hook基类', link: '/reference/client/hook-base' },
            { text: 'hook/delegate Hook委托', link: '/reference/client/hook-delegate' },
            { text: 'hook/providers Provider Hook', link: '/reference/client/hook-providers' },
            { text: 'hook/secondary 次级Hook', link: '/reference/client/hook-secondary' },
            { text: 'hook/utils Hook工具', link: '/reference/client/hook-utils' },
            { text: 'ipc IPC代理', link: '/reference/client/ipc' },
            { text: 'stub Stub组件', link: '/reference/client/stub' },
            { text: 'fixer 修复器', link: '/reference/client/fixer' },
            { text: 'env 运行环境', link: '/reference/client/env' },
            { text: 'natives Native方法表', link: '/reference/client/natives' },
            { text: 'interfaces 接口', link: '/reference/client/interfaces' },
            { text: 'badger 角标', link: '/reference/client/badger' }
          ]
        },
        {
          text: '⚙️ Hook 基类详解',
          collapsed: true,
          items: [
            { text: 'MethodProxy 方法代理基类', link: '/reference/client/method-proxy' },
            { text: 'Replace*MethodProxy 改参数族', link: '/reference/client/method-proxy-replace' },
            { text: 'StaticMethodProxy 静态代理', link: '/reference/client/method-proxy-static' },
            { text: 'ResultStaticMethodProxy 固定返回', link: '/reference/client/result-static-method-proxy' },
            { text: 'MethodInvocationStub 分发器', link: '/reference/client/method-invocation-stub' },
            { text: 'MethodInvocationProxy 注入器', link: '/reference/client/method-invocation-proxy' },
            { text: 'BinderInvocationProxy binder注入', link: '/reference/client/method-invocation-proxy-binder' },
            { text: 'BinderInvocationStub 假IBinder', link: '/reference/client/binder-invocation-stub' },
            { text: '@Inject/@SkipInject 注册注解', link: '/reference/client/inject-annotation' },
            { text: 'LogInvocation 日志注解', link: '/reference/client/log-invocation' },
            { text: 'MethodBox 调用封装', link: '/reference/client/method-box' }
          ]
        },
        {
          text: '⚙️ Stub 组件详解',
          collapsed: true,
          items: [
            { text: 'StubActivity 占位族', link: '/reference/client/stub-activity-family' },
            { text: 'StubDialog 弹窗存根', link: '/reference/client/stub-dialog' },
            { text: 'StubExclude 不进最近任务', link: '/reference/client/stub-exclude-recent' },
            { text: 'StubPending PendingIntent族', link: '/reference/client/stub-pending' },
            { text: 'Chooser/Resolver 选择器', link: '/reference/client/stub-chooser' },
            { text: 'StubCP 占位Provider', link: '/reference/client/stub-cp' },
            { text: 'Daemon 保活机制', link: '/reference/client/stub-daemon' },
            { text: 'VASettings 宿主配置', link: '/reference/client/va-settings' }
          ]
        },
        {
          text: '🪞 反射镜像 (mirror)',
          collapsed: true,
          items: [
            { text: '总览', link: '/reference/mirror/' },
            { text: 'Ref 引用框架', link: '/reference/mirror/mirror-ref-framework' },
            { text: '镜像类总表 (144)', link: '/reference/mirror/classes/' },
            { text: 'content 内容镜像', link: '/reference/mirror/mirror-content' },
            { text: 'app 应用框架镜像', link: '/reference/mirror/mirror-app' },
            { text: 'os OS镜像', link: '/reference/mirror/mirror-os' },
            { text: 'view 视图镜像', link: '/reference/mirror/mirror-view' },
            { text: 'telephony 电话镜像', link: '/reference/mirror/mirror-telephony' },
            { text: 'net 网络镜像', link: '/reference/mirror/mirror-net' },
            { text: 'media 媒体镜像', link: '/reference/mirror/mirror-media' },
            { text: 'location 定位镜像', link: '/reference/mirror/mirror-location' },
            { text: 'hardware 硬件镜像', link: '/reference/mirror/mirror-hardware' },
            { text: '其他子包', link: '/reference/mirror/mirror-misc' }
          ]
        },
        {
          text: '🧰 工具与数据',
          collapsed: true,
          items: [
            { text: 'helper 总览', link: '/reference/helper/' },
            { text: '顶层 持久化/dex优化', link: '/reference/helper/helper-top' },
            { text: 'compat 跨版本兼容 (14)', link: '/reference/helper/helper-compat' },
            { text: 'collection 集合', link: '/reference/helper/helper-collection' },
            { text: 'utils 通用工具 (18)', link: '/reference/helper/helper-utils' },
            {
              text: 'remote 跨进程数据类 (13)',
              link: '/reference/remote/',
              collapsed: true,
              items: [
                { text: 'PendingResultData 广播结果', link: '/reference/remote/pending-result-data' },
                { text: 'VCell 虚拟基站', link: '/reference/remote/vcell' },
                { text: 'VLocation 虚拟定位', link: '/reference/remote/vlocation' },
                { text: 'VWifi 虚拟WiFi', link: '/reference/remote/vwifi' }
              ]
            }
          ]
        },
        {
          text: '🦀 Native 层 (jni)',
          collapsed: true,
          items: [
            { text: '总览', link: '/reference/native/' },
            { text: 'Jni JNI桥接', link: '/reference/native/native-jni' },
            { text: 'Foundation 核心功能', link: '/reference/native/native-foundation' },
            { text: '  · IOUniformer IO hook', link: '/reference/native/native-io-uniformer' },
            { text: '  · SandboxFs 路径重定向', link: '/reference/native/native-sandbox-fs' },
            { text: '  · Path 路径规范化', link: '/reference/native/native-path' },
            { text: '  · fake_dlfcn 绕linker', link: '/reference/native/native-fake-dlfcn' },
            { text: '  · SymbolFinder 符号查找', link: '/reference/native/native-symbol-finder' },
            { text: '  · VMPatch ART hook入口', link: '/reference/native/native-vm-patch' },
            { text: 'Substrate x86_64 hook', link: '/reference/native/native-substrate' },
            { text: 'A64InlineHook arm64 hook', link: '/reference/native/native-a64' },
            { text: 'fb/lyra 异常处理', link: '/reference/native/native-fb' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/android-security-engineer/VirtualXposed-skills' }
    ],

    outline: {
      level: [2, 3],
      label: '本页内容'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    lastUpdatedText: '最后更新',

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索' },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
          }
        }
      }
    },

    footer: {
      message: '基于 <a href="https://github.com/asLody/VirtualApp">VirtualApp</a> 与 <a href="https://github.com/tiann/epic">epic</a>，仅供学习研究。VirtualApp 禁止商用。',
      copyright: '文档内容采用 CC BY-NC-SA 4.0 许可'
    }
  }
})
)
