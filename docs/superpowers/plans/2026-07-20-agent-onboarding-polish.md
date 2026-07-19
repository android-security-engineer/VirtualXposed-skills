# AI Agent 对接流程完善 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development`
> Steps use checkbox (`- [ ]`) syntax.

**Goal:** 修复 AI Agent 接入 VirtualXposed-skills 仓库时的数据失真与流程断点：让 `llms-index.json` 覆盖全部源码（含被漏扫的 mirror 185 类与 native 96 文件）、消除各处自相矛盾的文件数（481/478/239 → 真实 464 Java + 96 native）、修正 APK 签名描述与上游脱节的 README，并补一份端到端快速开始示例。

**Architecture:** 数据流：源码（`VirtualApp/lib/src`）→ 修好的 `gen-llms-index.mjs`（扫 virtual + mirror + jni）→ 重生成 `llms-index.json`（真值）→ `gen-llms-full.mjs` 校验手写文件的数字 → 修 `llms.txt`/`llms-full.txt`/`index.md`/`CLAUDE.md`/skill `reference.md` 对齐真值 → 修 `for-agents.md` APK 段事实 + 快速开始 → 重写 `README.md` → `pnpm build` 验证无死链。关键组件：生成脚本（唯一真值来源）、index（结构化检索）、llms.txt 协议三件套、skill 只读工具、for-agents 对接说明。为什么这样做：所有数字从生成脚本这一单一来源派生，手写文件用校验脚本守卫，根治"改一处忘一处"的漂移。

**Tech Stack:**
- 生成脚本：Node.js ESM（`website/scripts/gen-llms-index.mjs` 已有 / `gen-llms-full.mjs` 新建），纯静态扫描，无运行时依赖
- 静态产物：`website/public/llms-index.json`（结构化索引）、`llms.txt`/`llms-full.txt`（llms.txt 协议）
- 文档站：VitePress，`pnpm build` 验证零死链
- 源码扫描目标：`VirtualApp/lib/src/main/java/com/lody/virtual/`（279 Java）+ `VirtualApp/lib/src/main/java/mirror/`（185 Java，**当前被漏扫**）+ `VirtualApp/lib/src/main/jni/`（96 native）

**Risks:**
- **gen-llms-index.mjs 改正则后 mirror 185 类涌入，JSON 体积增大** → 缓解：native 只索引文件名/路径不解析 C++ 类；mirror 类正常索引但 JSON 仍 < 2MB（当前 110KB，翻倍后 ~250KB，远低于 2MB 告警线）。
- **mirror 在 `com/lody/mirror` 而非 `com/lody/virtual/mirror`，classifyModule 与 MODULE_DOC 要扩展** → 缓解：脚本 LIB_SRC 之外新增 MIRROR_SRC，模块名统一记 `mirror`，docLink 映射 `/reference/mirror/`。
- **数字牵涉 6+ 文件多处，漏改一处又自相矛盾** → 缓解：Task 3 改完后用 `grep -rn '481\|478\|239\|144'` 全量扫描确认零残留；Task 6 的 `gen-llms-full.mjs` 做 CI 级数字校验。
- **144 影子类说法需校真**：mirror 实际 185 个 Java 文件，但"影子类"可能特指 Ref* 系列。缓解：Task 3 统一改为"mirror 模块 185 个 Java 文件"，不再用"144 影子类"这个无来源数字。
- **README 重写偏离上游**：原 README 是 VirtualXposed 上游（android-hacker）的。缓解：保留上游用法/限制说明，前置本项目（教学文档站 fork）定位与 Agent 入口。
- **不触碰 VirtualApp/ 源码**：本计划只改 `website/`、根目录文档、`.claude/skills/`，符合 CLAUDE.md 只读约束。

---

### Task 1: 修复 gen-llms-index.mjs — 扫描 mirror 与 native，正则兼容包级私有类

**Depends on:** None
**Files:**
- Modify: `website/scripts/gen-llms-index.mjs:9-57`（LIB_SRC + MODULE_DOC + classifyModule + walkJava + parseClass）
- Modify: `website/scripts/gen-llms-index.mjs:59-92`（main：扫 mirror + jni，产出 nativeClasses，字段语义澄清）

- [ ] **Step 1: 修改 parseClass 正则以兼容包级私有类 — 不再强制 public 前缀**
文件: `website/scripts/gen-llms-index.mjs:49-57`

```javascript
function parseClass(src) {
  // 提取 package 与首个顶级 class/interface/enum 名（不强制 public，兼容包级私有类如 GPSStateline）
  const pkgMatch = src.match(/^package\s+([\w.]+);/m);
  const clsMatch = src.match(/(?:public\s+|final\s+|abstract\s+|static\s+)*\b(?:class|interface|enum)\s+(\w+)/);
  return {
    package: pkgMatch ? pkgMatch[1] : '',
    className: clsMatch ? clsMatch[1] : '',
  };
}
```

**理由**：原正则 `public\s+(?:final\s+|abstract\s+)?...` 强制 public 前缀，导致 41 个包级私有类（`GPSStateline`、`ActivityStack`、`TaskRecord` 等）被跳过，279 文件只识别 239 类。去掉 public 强制后全量覆盖。

- [ ] **Step 2: 扩展 MODULE_DOC 与 classifyModule — 纳入 mirror 模块**
文件: `website/scripts/gen-llms-index.mjs:14-34`

```javascript
// 模块 → 文档链接映射（从 config.mts sidebar 真实抽取）
const MODULE_DOC = {
  'client/hook/proxies': '/reference/proxies/',
  'client': '/reference/client/',
  'server': '/reference/server/',
  'mirror': '/reference/mirror/',
  'helper': '/reference/helper/',
  'remote': '/reference/remote/',
  'os': '/reference/helper/',
  'native': '/reference/native/',
};

function classifyModule(relPath) {
  // relPath 形如 client/hook/proxies/account/AccountStub.java
  if (relPath.startsWith('client/hook/proxies')) return 'client/hook/proxies';
  if (relPath.startsWith('client')) return 'client';
  if (relPath.startsWith('server')) return 'server';
  if (relPath.startsWith('mirror')) return 'mirror';
  if (relPath.startsWith('helper')) return 'helper';
  if (relPath.startsWith('remote')) return 'remote';
  if (relPath.startsWith('os')) return 'os';
  return 'other';
}
```

**理由**：mirror 在 `com/lody/mirror`（virtual 之外），原 MODULE_DOC 虽有 mirror 项但 classifyModule 永远匹配不到（LIB_SRC 不含 mirror），导致 185 个 mirror 类全被漏扫。

- [ ] **Step 3: 修改 main 扫描 mirror 与 jni — 产出全量 Java + native 索引**
文件: `website/scripts/gen-llms-index.mjs:9-11, 59-92`

替换 LIB_SRC 常量与 main 函数：

```javascript
const VIRTUAL_SRC = 'VirtualApp/lib/src/main/java/com/lody/virtual';
const MIRROR_SRC = 'VirtualApp/lib/src/main/java/mirror';
const JNI_SRC = 'VirtualApp/lib/src/main/jni';
const OUTPUT = 'website/public/llms-index.json';
const REPO_BASE = 'https://github.com/android-security-engineer/VirtualXposed-skills/blob/vxp';
```

```javascript
async function walkNative(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...await walkNative(full));
    } else if (/\.(cpp|c|cc|h|hpp)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

async function main() {
  // Java: virtual + mirror 两个根
  const virtualFiles = await walkJava(VIRTUAL_SRC);
  const mirrorFiles = await walkJava(MIRROR_SRC);
  const javaEntries = [];
  for (const abs of [...virtualFiles, ...mirrorFiles]) {
    const root = abs.includes('/com/lody/virtual/') ? VIRTUAL_SRC : MIRROR_SRC;
    const relToRoot = relative(root, abs);
    const relToRepo = relative('.', abs);
    const src = await readFile(abs, 'utf8');
    const { package: pkg, className } = parseClass(src);
    const module = classifyModule(relToRoot);
    javaEntries.push({
      className,
      package: pkg,
      module,
      sourcePath: relToRepo,
      sourceUrl: `${REPO_BASE}/${relToRepo}`,
      docLink: MODULE_DOC[module] || null,
    });
  }
  const validJava = javaEntries.filter(e => e.className);

  // Native: jni 目录，按文件索引（不解析 C++ 类，太复杂）
  const nativeFiles = await walkNative(JNI_SRC);
  const nativeEntries = nativeFiles.map(abs => {
    const relToRepo = relative('.', abs);
    return {
      fileName: abs.split('/').pop(),
      sourcePath: relToRepo,
      sourceUrl: `${REPO_BASE}/${relToRepo}`,
    };
  });

  const modules = { ...MODULE_DOC };
  delete modules['native']; // native 走 nativeClasses，不混入 modules 计数
  const index = {
    generatedFrom: [VIRTUAL_SRC, MIRROR_SRC, JNI_SRC],
    javaFileCount: validJava.length,
    nativeFileCount: nativeEntries.length,
    moduleCount: [...new Set(validJava.map(e => e.module))].length,
    modules: MODULE_DOC,
    classes: validJava,
    nativeClasses: nativeEntries,
  };
  await writeFile(OUTPUT, JSON.stringify(index, null, 2), 'utf8');
  const sizeKB = Math.round(JSON.stringify(index).length / 1024);
  console.log(`Generated ${OUTPUT}: ${validJava.length} Java classes + ${nativeEntries.length} native files, ${index.moduleCount} modules, ${sizeKB} KB`);
  if (sizeKB > 2048) {
    console.warn('WARN: index > 2MB, consider sharding by module');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
```

**理由**：原脚本 LIB_SRC 单一根 `com/lody/virtual`，漏掉 `com/lody/mirror`（185 类）。新增 MIRROR_SRC 双根扫描；新增 walkNative 扫 jni 的 `.cpp/.c/.cc/.h/.hpp`（96 文件）；字段从误导的 `fileCount` 改为明确的 `javaFileCount` + `nativeFileCount`，并新增 `nativeClasses` 数组供 Agent 检索 native 源码位置。

- [ ] **Step 4: 验证生成脚本**
Run: `cd /home/cc11001100/github/android-security-engineer/VirtualXposed-skills && node website/scripts/gen-llms-index.mjs`
Expected:
  - Exit code: 0
  - 输出含 `464 Java classes`（279 virtual + 185 mirror，去重 parseClass 失败后约 460-464）
  - 输出含 `96 native files`
  - 输出含 `8 modules`（含 mirror）

---

### Task 2: 创建 gen-llms-full.mjs 数字校验脚本 — 守卫手写文件不再漂移

**Depends on:** Task 1
**Files:**
- Create: `website/scripts/gen-llms-full.mjs`

- [ ] **Step 1: 创建数字校验脚本 — 读取 index 真值，校验手写文件的数字一致**

```javascript
// website/scripts/gen-llms-full.mjs
// 校验 llms.txt / llms-full.txt / index.md / CLAUDE.md 等手写文件里的源码数字
// 与 gen-llms-index.mjs 生成的 llms-index.json 真值一致。
// 不生成 llms-full.txt 全文（含叙述性文字，手写维护），只做数字守卫。
import { readFile } from 'node:fs/promises';

const INDEX = JSON.parse(await readFile('website/public/llms-index.json', 'utf8'));
const TRUTH = {
  javaFileCount: INDEX.javaFileCount,
  nativeFileCount: INDEX.nativeFileCount,
  moduleCount: INDEX.moduleCount,
};

// 各模块真实类数（从 index 派生）
const moduleCounts = {};
for (const c of INDEX.classes) {
  moduleCounts[c.module] = (moduleCounts[c.module] || 0) + 1;
}
TRUTH.moduleCounts = moduleCounts;

const TARGETS = [
  'website/public/llms.txt',
  'website/public/llms-full.txt',
  'website/index.md',
  'website/reference/index.md',
  'CLAUDE.md',
  '.claude/skills/virtualxposed/reference.md',
];

let failures = 0;
for (const target of TARGETS) {
  const text = await readFile(target, 'utf8');
  // 检查不应再出现的旧数字（已被真值取代）
  const stale = text.match(/\b(481|478|239|144)\b/g);
  if (stale) {
    console.error(`FAIL ${target}: 残留过时数字 ${[...new Set(stale)].join(', ')}`);
    failures++;
  }
  // 检查真值数字出现（至少 javaFileCount 应在某处）
  if (!text.includes(String(TRUTH.javaFileCount))) {
    console.warn(`WARN ${target}: 未出现真实 Java 数 ${TRUTH.javaFileCount}（可能无引用，非强制）`);
  }
}

console.log(`真值: Java=${TRUTH.javaFileCount}, native=${TRUTH.nativeFileCount}, modules=${TRUTH.moduleCount}`);
console.log(`模块分布: ${JSON.stringify(moduleCounts)}`);
if (failures > 0) {
  console.error(`\n${failures} 个文件含过时数字，请修正。`);
  process.exit(1);
}
console.log('\nOK: 无过时数字残留。');
```

- [ ] **Step 2: 验证校验脚本（此时应报残留，证明守卫生效）**
Run: `cd /home/cc11001100/github/android-security-engineer/VirtualXposed-skills && node website/scripts/gen-llms-full.mjs`
Expected:
  - Exit code: 1（因 Task 3 尚未修手写文件，应检出 481/478/239/144 残留）
  - 输出含 `FAIL` 与过时数字列表

- [ ] **Step 3: 提交 Task 1+2**
Run: `git add website/scripts/gen-llms-index.mjs website/scripts/gen-llms-full.mjs website/public/llms-index.json && git commit -m "feat(agent): gen-llms-index 扫描 mirror+native — 索引覆盖 464 Java + 96 native

原脚本 LIB_SRC 单一根 com/lody/virtual 漏扫 com/lody/mirror（185 类），
正则强制 public 漏 41 个包级私有类，且不扫 jni。
修正后全量覆盖，新增 nativeClasses 数组，字段改 javaFileCount/nativeFileCount。
新增 gen-llms-full.mjs 校验手写文件数字不再漂移。"`

---

### Task 3: 对齐所有手写文件的数字 — 消除 481/478/239/144 自相矛盾

**Depends on:** Task 1（需 index 真值）
**Files:**
- Modify: `website/public/llms-full.txt:4,14,15,18,47,50`
- Modify: `website/public/llms.txt:16`
- Modify: `website/index.md:7`
- Modify: `website/reference/index.md:6,9-16`
- Modify: `CLAUDE.md:9,38`
- Modify: `.claude/skills/virtualxposed/reference.md:23`

- [ ] **Step 1: 修改 llms-full.txt 数字 — 对齐真实 464 Java + 96 native + 8 模块**
文件: `website/public/llms-full.txt:4,14,15,18,47,50`

逐行替换：

第 4 行：
```text
所有数字（464 Java / 96 native / 45 服务代理 / 8 模块）均由 gen-llms-index.mjs 从源码静态扫描生成，gen-llms-full.mjs 校验。
```

第 14 行：
```text
VirtualXposed 的 lib 模块（464 Java + 96 native 源文件，含 com/lody/mirror 的 185 个反射镜像类）分为：
```

第 15-20 行（模块清单，文件数对齐真实）：
```text
- 🔌 服务代理 client/hook/proxies/（68 文件，45 个服务子目录）：系统服务的客户端 Hook 注入
- 🖥️ 虚拟服务 server/（60 文件）：server 进程里重新实现的系统服务（AMS/PMS/AccountManager 等）
- ⚙️ 客户端基建 client/（152 文件，含 proxies）：Hook 框架、IPC 桥、Stub、修复器
- 🪞 反射镜像 mirror/（185 文件）：Android 隐藏 API 的类型安全镜像（Ref* 系列包装）
- 🧰 工具与数据 helper/ · remote/（44 + 15 文件）：兼容工具、集合、跨进程数据类
- 🦀 Native 层 jni/（96 文件）：libc hook / ART hook / inline hook（x86_64 + arm64）
```

第 47 行：
```text
185 个 mirror 类把 Android 隐藏 API 包装成类型安全的静态字段访问，配合 free_reflection 解封 Android 9+ 反射限制。
```

第 50 行：
```text
96 个 native 源文件（.cpp/.c/.h/.hpp）：libc 文件 hook（IOUniformer/SandboxFs）、ART 方法 hook（VMPatch）、x86_64（Substrate）+ arm64（A64InlineHook）两套 inline hook 引擎、fake_dlfcn 绕 linker、SymbolFinder 符号查找。
```

第 33、35 行的 "48 个代理" 改为 "45 个服务代理"（proxies 真实子目录数 45）。

**理由**：481 是上游 VirtualApp 旧数字，本仓库 fork 子集真实 464；478 同源笔误；239 是脚本漏扫 mirror+包级私有类的错误结果；144 影子类无来源（mirror 实际 185）。全部对齐 gen-llms-index.mjs 真值。

- [ ] **Step 2: 修改 llms.txt 第 16 行**
文件: `website/public/llms.txt:16`

```text
- [源码参考总索引](https://android-security-engineer.github.io/VirtualXposed-skills/reference/): 464 Java + 96 native 源文件的逐模块解析
```

- [ ] **Step 3: 修改 website/index.md 第 7 行**
文件: `website/index.md:7`

```text
  tagline: 基于 VirtualApp + epic，在免 Root 环境下运行 Xposed 模块的 Android 虚拟化实现。本站是一份逐层拆解的教学文档，覆盖 464 个 Java 类与 96 个 native 源文件的实现细节。
```

- [ ] **Step 4: 修改 website/reference/index.md 第 6 行与表格**
文件: `website/reference/index.md:6,9-16`

第 6 行：
```text
VirtualXposed 的 `lib` 模块共有 **464 个 Java 文件 + 96 个 native 源文件**，按职责可归为六大组：
```

第 9-16 行表格（文件数对齐真实）：
```markdown
| 分组 | 路径 | 文件数 | 说明 |
| --- | --- | --- | --- |
| 🔌 服务代理 | [`client/hook/proxies/`](./proxies/) | 68 | 45 个系统服务的客户端 Hook 注入 |
| 🖥️ 虚拟服务 | [`server/`](./server/) | 60 | server 进程里重新实现的系统服务 |
| ⚙️ 客户端基建 | [`client/`](./client/) | 152 | Hook 框架、IPC 桥、Stub、修复器（含 proxies） |
| 🪞 反射镜像 | [`mirror/`](./mirror/) | 185 | Android 隐藏 API 的类型安全镜像 |
| 🧰 工具与数据 | [`helper/`](./helper/) · [`remote/`](./remote/) | 44 + 15 | 兼容工具、集合、跨进程数据类 |
| 🦀 Native 层 | [`jni/`](./native/) | 96 | libc hook / ART hook / inline hook |
```

- [ ] **Step 5: 修改 CLAUDE.md 第 9、38 行**
文件: `CLAUDE.md:9,38`

第 9 行：
```text
- `VirtualApp/` —— 原项目源码（只读参考，`lib` 模块含 464 个 Java + 96 个 native 源文件）
```

第 38 行：
```text
| `website/reference/` | 逐模块源码参考（10 个 index.md 索引，覆盖 464 Java + 96 native） |
```

- [ ] **Step 6: 修改 skill reference.md 第 23 行**
文件: `.claude/skills/virtualxposed/reference.md:23`

```text
`llms-index.json` 实际索引 464 个 Java 类（virtual 下 279 + mirror 下 185，含包级私有类）+ 96 个 native 文件，分布：client(152) + proxies(68) + server(60) + mirror(185) + helper(44) + remote(15) + os(5) + 顶层杂项(3)。
```

- [ ] **Step 7: 验证数字校验通过**
Run: `cd /home/cc11001100/github/android-security-engineer/VirtualXposed-skills && node website/scripts/gen-llms-full.mjs`
Expected:
  - Exit code: 0
  - 输出含 `OK: 无过时数字残留。`

- [ ] **Step 8: 验证无残留过时数字**
Run: `cd /home/cc11001100/github/android-security-engineer/VirtualXposed-skills && grep -rn '\b481\b\|\b478\b\|\b239 个\|144 影子' website/public/llms.txt website/public/llms-full.txt website/index.md website/reference/index.md CLAUDE.md .claude/skills/virtualxposed/reference.md 2>/dev/null`
Expected:
  - Exit code: 1（grep 无匹配）
  - 无任何输出

- [ ] **Step 9: 提交**
Run: `git add website/public/llms-full.txt website/public/llms.txt website/index.md website/reference/index.md CLAUDE.md .claude/skills/virtualxposed/reference.md && git commit -m "docs(agent): 对齐所有源码数字至真值 464 Java + 96 native — 消除 481/478/239/144 自相矛盾

481/478 是上游 VirtualApp 旧数字，239 是脚本漏扫 mirror+包级私有类的错误，
144 影子类无来源（mirror 实际 185）。全部由 gen-llms-index.mjs 真值统一，
gen-llms-full.mjs 守卫。"`

---

### Task 4: 修正 for-agents.md APK 段事实 + 补端到端快速开始

**Depends on:** None（与 Task 3 并行，无文件冲突）
**Files:**
- Modify: `website/dev/for-agents.md:62-72`（APK 段"已签名"→降级未签名说明）
- Modify: `website/dev/for-agents.md`（新增"快速开始：端到端示例"段）

- [ ] **Step 1: 修改第五层 APK 段 — 修正"已签名"为降级未签名说明**
文件: `website/dev/for-agents.md:62-72`

```markdown
## 第五层：预编译 APK 下载（Agent 获取可安装产物）

VirtualXposed 以 **APK** 形式分发。Agent 无需从源码编译，可直接下载 Release：

下载命令：`gh release download --repo android-security-engineer/VirtualXposed-skills --pattern '*.apk' --dir .`

或直接请求 latest release URL：`https://github.com/android-security-engineer/VirtualXposed-skills/releases/latest`

> ⚠️ **签名状态**：当仓库未配置 `VXP_*` 签名 Secret 时，`release.yml` 走**降级模式**产出**未签名** APK。Android 7+ 会拒绝安装未签名 APK（`INSTALL_PARSE_FAILED_NO_CERTIFICATES`），需用 apksigner 自行签名后安装（见下方快速开始）。配置签名 Secret 后推 `v*` tag 即产已签名 APK。

- APK 支持 arm64-v8a / x86_64，安装于 Android 5.0~10.0（Android 13 经兼容性修复亦可启动，见 commit `f3007dc5`）
- 需从源码编译时见 [/dev/build](./build)（含 jcenter 镜像、NDK r19c、keystore 配置）
- CI 流水线：`android.yml`（构建验证）+ `release.yml`（tag 触发发布，支持未签名降级）
```

**理由**：原段写"已签名"，但 release.yml 在无 Secret 时降级产未签名 APK（本会话刚修复并验证）。Agent 照原文下载安装会遇 `INSTALL_PARSE_FAILED_NO_CERTIFICATES`，是事实性误导。

- [ ] **Step 2: 在 for-agents.md 末尾新增"快速开始：端到端示例"段**
文件: `website/dev/for-agents.md`（文末"快速对接清单" mermaid 图之后追加）

```markdown
## 快速开始：Agent 端到端示例

下面给一个 Agent 从零接入的完整可复制流程，覆盖"下载 → 签名 → 安装 → 启动验证"与"改一个文档页"两条最常见路径。

### 路径 A：下载并安装 VirtualXposed APK

```bash
# 1. 下载最新 Release APK（可能是未签名降级版）
gh release download --repo android-security-engineer/VirtualXposed-skills --pattern '*.apk' --dir .

# 2. 若是未签名 APK，本地用 apksigner 签名（需自备 keystore）
BT=$ANDROID_SDK_HOME/build-tools/34.0.0
$BT/zipalign -p -f 4 VirtualXposed-*.apk aligned.apk
$BT/apksigner sign --ks your.jks --ks-pass pass:<pwd> --ks-key-alias <alias> \
  --key-pass pass:<pwd> --v1-signing-enabled true --v2-signing-enabled true \
  --v3-signing-enabled true aligned.apk
$BT/apksigner verify aligned.apk   # exit 0 = 签名有效

# 3. 安装到已连接的设备（adb）
adb install -r aligned.apk

# 4. 启动并验证（启动 Activity 为 SplashActivity，会跳转 NewHomeActivity）
adb shell am start -n io.va.exposed64/io.virtualapp.splash.SplashActivity
adb shell ps -A | grep exposed64            # 应见主进程 + io.va.exposed64:x 服务器进程
adb shell dumpsys activity activities | grep topResumedActivity  # 应为 NewHomeActivity
```

### 路径 B：定位某系统服务的 Hook 实现

```bash
# 1. 问"location 服务怎么 Hook 的" → 检索结构化索引
curl -s https://android-security-engineer.github.io/VirtualXposed-skills/llms-index.json \
  | jq '.classes[] | select(.module=="client/hook/proxies") | select(.className|test("Location";"i"))'

# 2. 得到 LocationStub 的 sourceUrl（GitHub 直链）+ docLink（/reference/proxies/）
# 3. 读 llms-full.txt 第 4.2 节拿"系统服务 Hook 统一模式"概览
# 4. 按 module 在 index 过滤 server/remote 的 location 相关类，得三层实现链
```

### 路径 C：改一个文档页并验证

```bash
cd website
pnpm install --frozen-lockfile
# 编辑 website/<某页>.md ...
pnpm build          # 零死链、无构建错误才算通过
```
```

**理由**：for-agents.md 原本只列 5 层资源，没给完整可复制流程。Agent 接入时最缺的是"照着做就能跑通"的端到端示例。路径 A 复用本会话验证过的签名+安装+启动流程；路径 B 示范 skill 工具 A/B 的实际检索用法；路径 C 是文档站改动的标准验证。

- [ ] **Step 3: 提交**
Run: `git add website/dev/for-agents.md && git commit -m "docs(agent): for-agents 修正 APK 签名降级说明 + 补端到端快速开始示例

APK 段从'已签名'改为降级未签名说明（release.yml 无 Secret 时），
新增路径 A/B/C 端到端示例：下载签名安装启动 / 检索 Hook 实现 / 改文档验证。"`

---

### Task 5: 重写 README.md — 从上游脱节内容改为本项目说明

**Depends on:** None（与 Task 3、4 并行）
**Files:**
- Modify: `README.md`（全文重写，保留上游用法说明）

- [ ] **Step 1: 重写 README.md — 前置本项目定位，保留上游用法**

```markdown
# VirtualXposed-skills

> VirtualXposed 的**教学文档站 + 源码解析**项目。基于 [VirtualXposed](https://github.com/android-hacker/VirtualXposed)（VirtualApp + epic），逐层拆解免 Root 运行 Xposed 模块的 Android 虚拟化实现（支持 Android 5.0~10.0）。

[![Build Status](https://github.com/android-security-engineer/VirtualXposed-skills/actions/workflows/android.yml/badge.svg)](https://github.com/android-security-engineer/VirtualXposed-skills/actions/workflows/android.yml)

本仓库不是可运行 App 仓库，分两部分：

- `VirtualApp/` —— VirtualXposed 原项目源码（只读参考，`lib` 模块含 464 Java + 96 native 源文件）
- `website/` —— VitePress 文档站，逐层拆解 VirtualXposed 的原理与源码：[在线访问](https://android-security-engineer.github.io/VirtualXposed-skills/)

## 快速开始

### 下载 APK

```bash
gh release download --repo android-security-engineer/VirtualXposed-skills --pattern '*.apk' --dir .
```

> 未配置签名 Secret 时 Release 为未签名降级版，Android 7+ 需用 apksigner 自行签名后安装。详见 [下载与构建文档](https://android-security-engineer.github.io/VirtualXposed-skills/dev/build)。

### 用 VirtualXposed

VirtualXposed 是一个免 Root、免解锁 Bootloader 的 App，让任意 Xposed 模块在普通 App 进程内加载并激活。两大限制：(1) 不支持修改系统；(2) 不支持资源 Hook。

使用步骤：

1. 下载 APK 安装到 Android 5.0~10.0 设备
2. 打开 VirtualXposed，点主页底部按钮 → Add App，把目标 App 和 Xposed 模块都装进虚拟环境
3. 在 VirtualXposed 内的 Xposed Installer 里激活模块
4. 点 Settings → Reboot 重启 VirtualXposed（无需重启手机）

> ⚠️ 目标 App 和 Xposed 模块**必须都装在 VirtualXposed 虚拟环境内**，任一装在宿主系统都不生效。

## 文档与源码

- [文档站](https://android-security-engineer.github.io/VirtualXposed-skills/) —— 入门、架构、功能详解、源码参考
- [源码参考索引](https://android-security-engineer.github.io/VirtualXposed-skills/reference/) —— 464 Java + 96 native 逐模块解析
- [本地构建](https://android-security-engineer.github.io/VirtualXposed-skills/dev/build) —— 从源码编译 APK

## AI Agent 对接

本仓库为 AI Agent 提供三层对接能力（[详见](https://android-security-engineer.github.io/VirtualXposed-skills/dev/for-agents)）：

- `CLAUDE.md` / `AGENTS.md` —— 项目级上下文
- `website/public/llms.txt` + `llms-full.txt` + `llms-index.json` —— llms.txt 协议与结构化源码索引
- `.claude/skills/virtualxposed/` —— Claude Code 只读导航 skill

## Credits

- [VirtualApp](https://github.com/asLody/VirtualApp)
- [epic](https://github.com/tiann/epic)
- [Xposed](https://github.com/rovo89/Xposed)

> 商业用途请遵循 VirtualApp 的 [声明](https://github.com/asLody/VirtualApp)。
```

**理由**：原 README 是上游 `android-hacker/VirtualXposed` 的内容（指向其 release 页面、失效的 travis-ci 徽章、GameGuardian/VirusTotal 段），与本 fork（教学文档站）完全脱节。Agent 读 README 会被误导去错仓库。重写后前置本项目定位，保留 VirtualXposed 用法说明，补 Agent 入口。

- [ ] **Step 2: 提交**
Run: `git add README.md && git commit -m "docs: 重写 README 为本项目（教学文档站）说明 — 脱离上游 android-hacker 内容

原 README 是上游 VirtualXposed 仓库内容（指向其 release、失效 travis 徽章），
与本 fork 脱节。重写后前置本项目定位 + APK 下载 + Agent 对接入口，保留用法说明。"`

---

### Task 6: 更新 SKILL.md 工具 A/B 含 native + 文档站构建验证无死链

**Depends on:** Task 1, 2, 3, 4, 5
**Files:**
- Modify: `.claude/skills/virtualxposed/SKILL.md:19-31`（工具 A/B 补 native 检索说明）
- Modify: `.claude/skills/virtualxposed/SKILL.md:10-14`（知识来源补 nativeClasses）

- [ ] **Step 1: 修改 SKILL.md 知识来源与工具 A/B — 补 native 检索能力**
文件: `.claude/skills/virtualxposed/SKILL.md:10-14, 19-31`

知识来源第 1 项改为：
```markdown
1. **结构化索引**：`website/public/llms-index.json` —— 全部 464 Java 类（`classes`）+ 96 native 文件（`nativeClasses`）→ 源码文件 → 模块 → 文档链接。查"某类/某文件在哪"用这个。
```

工具 A 末尾补：
```markdown
4. 若查的是 native 文件（如"VMPatch 在哪"、"libc hook 实现"），改查 `nativeClasses` 数组，按 `fileName` 过滤，返回 `sourceUrl` + `/reference/native/` 文档链接
```

工具 B 第 2 步补：
```markdown
2. 按 module 在 `llms-index.json` 过滤相关类（如 location → `client/hook/proxies` + `server` + `remote` 三个 module 的 location 相关类；涉及 native 层如 IO 重定向 → 额外查 `nativeClasses` 里 IOUniformer/SandboxFs 等）
```

**理由**：SKILL.md 工具 A/B 承诺"查源码位置"，但 index 原不含 native、不含 mirror，Agent 查这两类会落空。Task 1 已让 index 覆盖全量，skill 文档同步补 native 检索说明。

- [ ] **Step 2: 验证文档站构建无死链**
Run: `cd /home/cc11001100/github/android-security-engineer/VirtualXposed-skills/website && pnpm install --frozen-lockfile && pnpm build`
Expected:
  - Exit code: 0
  - 输出含 `building client` → `rendered` → 无 deadlink 报错
  - `website/.vitepress/dist/` 生成

- [ ] **Step 3: 验证 dist 下产物数字已更新**
Run: `cd /home/cc11001100/github/android-security-engineer/VirtualXposed-skills && grep -c '464' website/.vitepress/dist/llms.txt website/.vitepress/dist/llms-full.txt 2>/dev/null`
Expected:
  - 每个文件至少 1 次匹配（dist 已同步真值）

- [ ] **Step 4: 提交**
Run: `git add .claude/skills/virtualxposed/SKILL.md && git commit -m "docs(agent): SKILL.md 工具 A/B 补 native 检索 — 索引已覆盖 nativeClasses

知识来源第 1 项与工具 A/B 同步说明 nativeClasses 检索，
Agent 查 native 源码位置（VMPatch/IOUniformer 等）不再落空。"`

---

## 执行后验证（全 Task 完成后）

```bash
# 1. 数字真值一致
node website/scripts/gen-llms-index.mjs      # 重新生成
node website/scripts/gen-llms-full.mjs        # 校验，应 OK

# 2. 无过时数字残留
grep -rn '\b481\b\|\b478\b\|\b239 个\|144 影子' website/ CLAUDE.md AGENTS.md .claude/ 2>/dev/null
# 期望：无输出

# 3. 文档站零死链
cd website && pnpm build

# 4. index 覆盖全量
jq '.javaFileCount, .nativeFileCount, (.classes|length), (.nativeClasses|length)' website/public/llms-index.json
# 期望：~464, 96, ~464, 96
```

---

## 执行结果记录（2026-07-20）

### 全部 6 Task 完成

- **Task 1** ✅ `gen-llms-index.mjs` 修复：parseClass 去掉 public 强制（覆盖包级私有类）、新增 walkNative 扫 jni、main 双根扫描 virtual+mirror、字段改 `javaFileCount`/`nativeFileCount`/`nativeClasses`
- **Task 2** ✅ 新建 `gen-llms-full.mjs` 数字校验脚本，守卫正则覆盖 `481|478|239|144|48 个|48 代理`
- **Task 3** ✅ 对齐全部手写文件数字至真值：llms.txt / llms-full.txt / index.md / reference/index.md / CLAUDE.md / skill reference.md，并 sed 批量替换 reference/client + reference/proxies 下 13 处 "48 个" → "45 个"，core.md 1 处 "48 代理"
- **Task 4** ✅ for-agents.md APK 段修正签名降级说明 + 新增路径 A/B/C 端到端示例
- **Task 5** ✅ README.md 重写为本项目说明（脱离上游 android-hacker）
- **Task 6** ✅ SKILL.md 工具 A/B 补 native 检索 + `pnpm build` 零死链通过

### 真值数据（gen-llms-index.mjs 生成）

| 项 | 旧（错误） | 真值 |
|----|----------|------|
| Java 文件 | 481/478/239 | **464**（virtual 279 + mirror 185） |
| native 文件 | 0（index 不含） | **96**（.cpp/.c/.h/.hpp） |
| 模块数 | 7（漏 mirror） | **8**（含 mirror） |
| 服务代理 | 48 | **45**（proxies 子目录数） |
| mirror 类 | 144 影子类 | **185** |

模块分布：other 3, client 84, proxies 68, helper 44, os 5, remote 15, server 60, mirror 185。

### 核心发现（调研阶段）

1. **mirror 模块被完全漏扫**：`com/lody/mirror`（185 类，约占总数 40%）不在 `com/lody/virtual` 下，原脚本 LIB_SRC 单一根扫不到。文档重点宣传"反射镜像"但 index 里一个 mirror 类都没有。
2. **41 个包级私有类被跳过**：parseClass 强制 `public\s+` 前缀，`GPSStateline`/`ActivityStack`/`TaskRecord` 等落空。
3. **index 完全不含 native**：96 个 jni 文件未被索引，但 SKILL.md 工具 A/B 承诺能查源码位置。
4. **数字多处自相矛盾**：481（llms.txt/llms-full.txt/index.md）、478（CLAUDE.md/llms-full.txt）、239（skill reference.md）—— Agent 读不同入口得到不同数。
5. **for-agents.md APK 段事实错误**：写"已签名"，实际 release.yml 无 Secret 时降级产未签名 APK。
6. **README 是上游仓库内容**：指向 android-hacker/VirtualXposed release、失效 travis 徽章，与本 fork 脱节。

### 提交记录

- `9aa01b29` feat(agent): gen-llms-index 扫描 mirror+native
- `171aee53` docs(agent): 对齐所有源码数字至真值 464+96+45+185
- `68adbc60` docs(agent): for-agents 修正 APK 签名 + 补快速开始
- `2d3e0904` docs: 重写 README 为本项目说明
- `4aed1afa` docs(agent): SKILL.md 工具 A/B 补 native 检索

### 验证

```bash
node website/scripts/gen-llms-index.mjs   # 464 Java + 96 native + 8 modules
node website/scripts/gen-llms-full.mjs   # OK: 无过时数字残留
cd website && pnpm build                  # 零死链通过
```
