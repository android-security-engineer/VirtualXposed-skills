# VirtualXposed APK 构建 CI/CD 与 Release 分发 Plan

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development`
> Steps use checkbox (`- [ ]`) syntax.

**Goal:** 重建 GitHub Actions 流水线，从 VirtualApp 源码自动构建出可安装的签名 APK 并发布为 GitHub Release，让 AI Agent 与用户能直接下载现成 APK 而非每次从源码编译；修复 jcenter 失效阻断；并文档化源码编译与 CI 配置全流程。

**Architecture:** 数据流：push/tag 触发 → CI checkout(含 launcher submodule) → setup JDK8 + NDK → 解码 keystore Secret 写 local.properties → `./gradlew assembleAospRelease`（jcenter 走阿里云镜像续命老栈 AGP3.2.1）→ 产出签名 APK → tag 触发时用 gh-release 发布为 Release 资产。关键组件：(1) 修复 `VirtualApp/build.gradle` 两处 jcenter 追加阿里云镜像（根因：jcenter 2021 停服导致依赖拉取失败）；(2) 重写 `android.yml`（旧版用 v1 废弃 actions + 无签名 + 不发布）；(3) 新增 `release.yml` tag 触发发布；(4) keystore 通过 GitHub Secrets 注入（base64 解码）。为什么这样做：不升级 AGP 3.2.1→7.x（那是另一个会连带迁移 gradle-experimental→ndk 插件、Java8→11 的大工程，超出范围），用阿里云 jcenter 镜像最小改动让 2018 老栈在 CI 跑通；签名用 Secrets 标准做法，复用 app build.gradle 已有的 aosp flavor 签名逻辑（仅 local.properties 配 keystore 即生效）。

**Tech Stack:** GitHub Actions (actions/checkout@v4, setup-java@v4, upload-artifact@v4, softprops/action-gh-release@v2), AGP 3.2.1, Gradle 4.6, JDK 8, Android SDK 28 + build-tools 28.0.3, NDK r19c, ndkBuild + Android.mk, 阿里云 jcenter 镜像

**Risks:**
- jcenter 阿里云镜像可能仍缺个别老依赖 → 缓解：镜像 + jitpack 双保险；Task 2 验证步骤若暴露缺失包，记录具体包名后补 mirror
- AGP 3.2.1 与现代 NDK 可能不匹配 → 缓解：CI 固定 NDK r19c（2019 年版本，与 AGP3.2.1 同代），不取 latest
- `gradle-experimental:0.11.1`（native 插件）已废弃，某些 NDK 版本报错 → 缓解：r19c 是其兼容版本；CI 验证若失败则降级到 r18b
- 签名 keystore 首次需本地生成 → 缓解：Task 3 提供生成脚本 + base64 编码说明，用户跑一次存入 Secrets
- launcher submodule 是第三方 Launcher3，可能也有 jcenter 依赖 → 缓解：根 build.gradle 的 allprojects 镜像对子项目生效
- AGP 升级明确不在本 Plan 范围 → 避免范围蔓延，仅续命老栈

---

### Task 1: 修复 Gradle jcenter 仓库失效 — 追加阿里云镜像

**Depends on:** None
**Files:**
- Modify: `VirtualApp/build.gradle:4-10`（buildscript repositories）
- Modify: `VirtualApp/build.gradle:20-30`（allprojects repositories）

- [ ] **Step 1: 修改 buildscript repositories — 在 jcenter 前追加阿里云镜像**
文件: `VirtualApp/build.gradle:4-10`（buildscript.repositories 区块，google 与 jcenter 之间）

```groovy
// 替换 VirtualApp/build.gradle:4-10 的 buildscript repositories 区块
    repositories {
        maven {
            url 'https://maven.google.com/'
            name 'Google'
        }
        maven {
            url 'https://maven.aliyun.com/repository/jcenter'
            name 'AliyunJcenter'
        }
        jcenter()
    }
```

- [ ] **Step 2: 修改 allprojects repositories — 同样追加阿里云镜像**
文件: `VirtualApp/build.gradle:20-30`（allprojects.repositories 区块）

```groovy
// 替换 VirtualApp/build.gradle:20-30 的 allprojects repositories 区块
    repositories {
        mavenLocal()
        maven {
            url "https://jitpack.io"
        }
        maven {
            url 'https://maven.google.com/'
            name 'Google'
        }
        maven {
            url 'https://maven.aliyun.com/repository/jcenter'
            name 'AliyunJcenter'
        }
        jcenter()
    }
```

- [ ] **Step 3: 验证 build.gradle 语法（groovy 括号配对）**
Run: `cd VirtualApp && grep -c "AliyunJcenter" build.gradle && python3 -c "
s=open('build.gradle').read()
print('open', s.count('{'), 'close', s.count('}'))
assert s.count('{')==s.count('}'), 'brace mismatch'
print('BRACE OK')"`
Expected:
  - Exit code: 0
  - Output contains: "2"（两处 AliyunJcenter）
  - Output contains: "BRACE OK"

- [ ] **Step 4: 提交**
Run: `git add VirtualApp/build.gradle && git commit -m "fix(build): add aliyun jcenter mirror to unblock dependency resolution

jcenter() shut down in 2021; prepend https://maven.aliyun.com/repository/jcenter
mirror in both buildscript and allprojects repositories so the legacy
AGP 3.2.1 / Gradle 4.6 stack can still resolve dependencies in CI.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"`

---

### Task 2: 重写 android.yml CI 构建流水线 — 现代化 + 签名 + 产物上传

**Depends on:** Task 1
**Files:**
- Modify: `.github/workflows/android.yml`（完全重写）

- [ ] **Step 1: 重写 android.yml — 用现代 v4 actions、固定 NDK、注入签名、上传签名 APK**

```yaml
# .github/workflows/android.yml
name: Android CI

on:
  push:
    branches: [vxp, main]
    paths:
      - 'VirtualApp/**'
      - '.github/workflows/android.yml'
  pull_request:
    paths:
      - 'VirtualApp/**'
      - '.github/workflows/android.yml'
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout (with submodules)
        uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Set up JDK 8
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '8'

      - name: Set up Android SDK
        uses: android-actions/setup-android@v3
        with:
          packages: 'build-tools;28.0.3 platforms;android-28 ndk;19.2.5345600'

      - name: Grant execute permission for gradlew
        run: chmod +x VirtualApp/gradlew

      - name: Decode release keystore
        if: ${{ secrets.VXP_KEYSTORE_BASE64 != '' }}
        run: |
          echo "${{ secrets.VXP_KEYSTORE_BASE64 }}" | base64 -d > VirtualApp/release.jks
          echo "keystore.path=release.jks" > VirtualApp/local.properties
          echo "keystore.alias=${{ secrets.VXP_KEY_ALIAS }}" >> VirtualApp/local.properties
          echo "keystore.pwd=${{ secrets.VXP_KEY_PWD }}" >> VirtualApp/local.properties
          echo "keystore.alias_pwd=${{ secrets.VXP_STORE_PWD }}" >> VirtualApp/local.properties

      - name: Build aosp release APK
        working-directory: VirtualApp
        run: ./gradlew assembleAospRelease --no-daemon

      - name: Build fdroid release APK (unsigned fallback)
        working-directory: VirtualApp
        run: ./gradlew assembleFdroidRelease --no-daemon

      - name: Locate built APKs
        run: |
          find VirtualApp/app/build/outputs/apk -name "*.apk" -print
          mkdir -p artifacts
          cp VirtualApp/app/build/outputs/apk/aosp/release/*.apk artifacts/ 2>/dev/null || true
          cp VirtualApp/app/build/outputs/apk/fdroid/release/*.apk artifacts/ 2>/dev/null || true
          ls -la artifacts/

      - name: Upload APK artifacts
        uses: actions/upload-artifact@v4
        with:
          name: virtualxposed-apk
          path: artifacts/*.apk
          retention-days: 30
```

- [ ] **Step 2: 验证 android.yml YAML 语法合法**
Run: `python3 -c "import yaml; d=yaml.safe_load(open('.github/workflows/android.yml')); print('jobs:', list(d['jobs'].keys())); print('steps:', len(d['jobs']['build']['steps']))"`
Expected:
  - Exit code: 0
  - Output contains: "jobs: ['build']"
  - Output contains: "steps: 8"

- [ ] **Step 3: 验证 workflow 触发条件与签名条件分支正确**
Run: `grep -n "secrets.VXP_KEYSTORE_BASE64\|assembleAospRelease\|upload-artifact@v4\|submodules: recursive" .github/workflows/android.yml`
Expected:
  - Exit code: 0
  - 4 个关键行全部匹配到

- [ ] **Step 4: 提交**
Run: `git add .github/workflows/android.yml && git commit -m "ci(android): rewrite build workflow with modern actions, NDK pinning, signing

- Replace v1 (deprecated) actions with v4 (checkout/setup-java/upload-artifact)
- Pin NDK r19c (19.2.5345600) compatible with AGP 3.2.1 / gradle-experimental
- Inject release keystore from GitHub Secrets (base64-decoded to local.properties)
- Build both aosp (signed) and fdroid (unsigned) flavors
- Upload APK artifacts with 30-day retention

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"`

---

### Task 3: 创建 release.yml — tag 触发发布签名 APK 到 GitHub Release

**Depends on:** Task 2
**Files:**
- Create: `.github/workflows/release.yml`

- [ ] **Step 1: 创建 release.yml — 推 v* tag 时构建并发布 Release**

```yaml
# .github/workflows/release.yml
name: Release APK

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      tag:
        description: 'Release tag (e.g. v0.22.0)'
        required: true

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout (with submodules)
        uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Set up JDK 8
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '8'

      - name: Set up Android SDK
        uses: android-actions/setup-android@v3
        with:
          packages: 'build-tools;28.0.3 platforms;android-28 ndk;19.2.5345600'

      - name: Grant execute permission for gradlew
        run: chmod +x VirtualApp/gradlew

      - name: Decode release keystore
        run: |
          echo "${{ secrets.VXP_KEYSTORE_BASE64 }}" | base64 -d > VirtualApp/release.jks
          echo "keystore.path=release.jks" > VirtualApp/local.properties
          echo "keystore.alias=${{ secrets.VXP_KEY_ALIAS }}" >> VirtualApp/local.properties
          echo "keystore.pwd=${{ secrets.VXP_KEY_PWD }}" >> VirtualApp/local.properties
          echo "keystore.alias_pwd=${{ secrets.VXP_STORE_PWD }}" >> VirtualApp/local.properties

      - name: Build signed aosp release APK
        working-directory: VirtualApp
        run: ./gradlew assembleAospRelease --no-daemon

      - name: Rename APK with tag
        id: apk
        run: |
          TAG="${{ github.event.inputs.tag || github.ref_name }}"
          mkdir -p release-assets
          cp VirtualApp/app/build/outputs/apk/aosp/release/*.apk "release-assets/VirtualXposed-${TAG}.apk"
          echo "tag=${TAG}" >> $GITHUB_OUTPUT
          ls -la release-assets/

      - name: Create GitHub Release and upload APK
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ steps.apk.outputs.tag }}
          name: VirtualXposed ${{ steps.apk.outputs.tag }}
          files: release-assets/*.apk
          body: |
            ## VirtualXposed ${{ steps.apk.outputs.tag }}

            免 Root 运行 Xposed 模块的 Android 虚拟化实现。

            ### 安装

            下载下方 `VirtualXposed-${{ steps.apk.outputs.tag }}.apk`，在 Android 5.0~10.0 设备上直接安装（已签名，arm64-v8a / x86_64）。

            ### 从源码构建

            见 [源码构建文档](https://android-security-engineer.github.io/VirtualXposed-skills/dev/build)。

            ### AI Agent 下载

            ```bash
            gh release download ${{ steps.apk.outputs.tag }} --repo android-security-engineer/VirtualXposed-skills
            ```
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

- [ ] **Step 2: 验证 release.yml YAML 语法与权限**
Run: `python3 -c "import yaml; d=yaml.safe_load(open('.github/workflows/release.yml')); j=d['jobs']['release']; print('permissions:', j.get('permissions')); print('steps:', len(j['steps']))"`
Expected:
  - Exit code: 0
  - Output contains: "contents: write"
  - Output contains: "steps: 9"

- [ ] **Step 3: 验证 tag 触发条件与 release action 引用正确**
Run: `grep -n "tags:\|'v\*'\|softprops/action-gh-release@v2\|GITHUB_TOKEN" .github/workflows/release.yml`
Expected:
  - Exit code: 0
  - 全部关键行匹配到

- [ ] **Step 4: 提交**
Run: `git add .github/workflows/release.yml && git commit -m "ci(release): add tag-triggered workflow to publish signed APK as GitHub Release

Pushing a v* tag (or workflow_dispatch) builds the signed aosp APK and
publishes it as a GitHub Release asset. Lets AI agents and users download
a ready APK instead of building from source each time.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"`

---

### Task 4: 创建 keystore 生成脚本 — 供首次配置签名密钥

**Depends on:** None
**Files:**
- Create: `scripts/generate-keystore.sh`

- [ ] **Step 1: 创建 generate-keystore.sh — 生成本地 release keystore 并输出 base64 供存入 GitHub Secrets**

```bash
#!/usr/bin/env bash
# scripts/generate-keystore.sh
# 生成 VirtualXposed release 签名 keystore，并输出 base64 编码，
# 用于存入 GitHub Secrets (VXP_KEYSTORE_BASE64)。
# 首次配置 CI 签名时运行一次。keystore 一旦用于发布 Release 后不可更换（否则签名不一致）。

set -euo pipefail

OUT="${1:-release.jks}"
ALIAS="vxp"
STORE_PWD="virtualxposed"
KEY_PWD="virtualxposed"

if [ -f "$OUT" ]; then
  echo "ERROR: $OUT 已存在，如需重新生成请先删除或指定其他路径。" >&2
  exit 1
fi

echo "==> 生成 keystore: $OUT (alias=$ALIAS)"
keytool -genkeypair -v \
  -keystore "$OUT" \
  -storetype JKS \
  -keyalg RSA -keysize 2048 -validity 36500 \
  -alias "$ALIAS" \
  -storepass "$STORE_PWD" \
  -keypass "$KEY_PWD" \
  -dname "CN=VirtualXposed, OU=Dev, O=android-security-engineer, C=CN"

echo ""
echo "==> 完成。请将以下值填入 GitHub 仓库 Secrets（Settings → Secrets and variables → Actions）："
echo ""
echo "  VXP_KEYSTORE_BASE64 : $(base64 -w 0 "$OUT")"
echo "  VXP_KEY_ALIAS       : $ALIAS"
echo "  VXP_STORE_PWD       : $STORE_PWD"
echo "  VXP_KEY_PWD         : $KEY_PWD"
echo ""
echo "⚠️  妥善保管 $OUT，丢失后无法发布同签名的后续版本。"
```

- [ ] **Step 2: 赋予执行权限并验证脚本语法**
Run: `chmod +x scripts/generate-keystore.sh && bash -n scripts/generate-keystore.sh && echo "SYNTAX OK"`
Expected:
  - Exit code: 0
  - Output contains: "SYNTAX OK"

- [ ] **Step 3: 验证脚本结构含关键命令（不实际执行 keytool）**
Run: `grep -n "keytool -genkeypair\|VXP_KEYSTORE_BASE64\|base64 -w 0\|set -euo pipefail" scripts/generate-keystore.sh`
Expected:
  - Exit code: 0
  - 4 个关键模式全部匹配

- [ ] **Step 4: 提交**
Run: `git add scripts/generate-keystore.sh && git commit -m "chore(scripts): add generate-keystore.sh for CI release signing setup

Generates a release keystore and prints base64 + secret values to
configure GitHub Secrets (VXP_KEYSTORE_BASE64 / VXP_KEY_ALIAS /
VXP_STORE_PWD / VXP_KEY_PWD). Run once before first tagged release.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"`

---

### Task 5: 增强构建文档 — 落地 jcenter 镜像、CI Secret 配置、Release 下载入口

**Depends on:** Task 2, Task 3, Task 4
**Files:**
- Modify: `website/dev/build.md:149-176`（CI 构建章节重写）
- Modify: `website/dev/build.md:178-191`（常见问题更新）
- Modify: `website/dev/build.md`（追加"下载预编译 APK"章节，在"小结"前）
- Modify: `website/public/llms.txt`（追加 Release 下载链接）
- Modify: `website/dev/for-agents.md`（追加 Release 下载章节）

- [ ] **Step 1: 重写 build.md 的 CI 构建章节 — 反映新的 android.yml 与 release.yml**
文件: `website/dev/build.md:149-176`（"## CI 构建（参考）"章节到下一章节前）

```markdown
## CI 构建

仓库提供两条 GitHub Actions 流水线：

| Workflow | 文件 | 触发 | 产物 |
| --- | --- | --- | --- |
| Android CI | `.github/workflows/android.yml` | push 到 vxp/main、PR | APK artifact（30 天） |
| Release APK | `.github/workflows/release.yml` | 推 `v*` tag | GitHub Release 资产（永久） |

### Android CI（构建验证）

每次推送 VirtualApp 改动或 PR，CI 会：

1. checkout 含 launcher submodule
2. JDK 8 + Android SDK 28 + NDK r19c（19.2.5345600）
3. 从 GitHub Secrets 解码 release keystore 写入 `local.properties`
4. `./gradlew assembleAospRelease`（签名）+ `assembleFdroidRelease`（未签名）
5. 上传 APK 为 artifact（`virtualxposed-apk`，保留 30 天）

### Release APK（发布分发）

推送 `v*` tag（如 `git tag v0.22.1 && git push origin v0.22.1`）触发发布：

1. 同样构建签名 aosp APK
2. 重命名为 `VirtualXposed-<tag>.apk`
3. 用 `softprops/action-gh-release` 创建 GitHub Release 并上传 APK

> ⚠️ 首次发布前需配置签名密钥，见下文[签名密钥配置](#签名密钥配置)。

### 签名密钥配置

CI 的 Release 流程需要 4 个 GitHub Secret（仓库 Settings → Secrets and variables → Actions）：

| Secret | 值 | 来源 |
| --- | --- | --- |
| `VXP_KEYSTORE_BASE64` | keystore 的 base64 | `base64 -w 0 release.jks` |
| `VXP_KEY_ALIAS` | `vxp` | generate-keystore.sh 默认 |
| `VXP_STORE_PWD` | keystore 密码 | `virtualxposed`（可改） |
| `VXP_KEY_PWD` | key 密码 | `virtualxposed`（可改） |

生成 keystore（运行 `./scripts/generate-keystore.sh release.jks`，脚本会输出 base64 与各 Secret 值，填入 GitHub Secrets 即可）。

> ⚠️ keystore 一旦用于发布 Release 不可更换（否则后续版本签名不一致，无法覆盖安装）。妥善备份 `release.jks`。
```

- [ ] **Step 2: 更新 build.md 常见问题章节 — 反映 jcenter 已落地镜像**
文件: `website/dev/build.md:178-191`（"## 常见问题"与"## 小结"章节）

```markdown
## 常见问题

- **依赖拉不到**：项目原用 jcenter（2021 年停服），已在 `VirtualApp/build.gradle` 的 buildscript 与 allprojects 两处追加阿里云镜像 `https://maven.aliyun.com/repository/jcenter`。若仍缺包，检查具体包名是否仅存在于 jcenter，可补 `maven { url 'https://maven.aliyun.com/repository/public' }`。
- **NDK 版本不匹配**：`gradle-experimental:0.11.1` 是废弃的 native 插件，需 NDK r19c（19.2.5345600）。CI 已固定此版本；本地建议用同版本，新版 NDK 可能报错。
- **launcher submodule 缺失**：`git submodule update --init --recursive`，CI 已自动处理。
- **CI 签名失败**：检查 4 个 `VXP_*` Secret 是否都已配置；`VXP_KEYSTORE_BASE64` 必须是 `base64 -w 0`（单行无换行）输出。

## 小结

- `./gradlew assembleFdroidRelease` 出未签名 APK，`assembleAospRelease` 需配 keystore。
- CI `android.yml` 自动构建验证，`release.yml` 在推 `v*` tag 时发布签名 APK 到 GitHub Release。
- jcenter 已用阿里云镜像续命老栈（AGP 3.2.1 / Gradle 4.6）；升级 AGP 不在本阶段范围。
```

- [ ] **Step 3: 在 build.md 小结前追加"下载预编译 APK"章节 — 给 Agent 与用户的快捷入口**
文件: `website/dev/build.md`（"## 小结"章节之前插入新章节）

```markdown
## 下载预编译 APK

无需从源码编译，直接下载已构建的签名 APK：

- **GitHub Releases**：[releases 页面](https://github.com/android-security-engineer/VirtualXposed-skills/releases)，下载最新 `VirtualXposed-v*.apk`
- **命令行**：`gh release download --repo android-security-engineer/VirtualXposed-skills --pattern '*.apk'`（下载最新版），或 `gh release download v0.22.1 --repo android-security-engineer/VirtualXposed-skills`（指定版本）
- **AI Agent**：在脚本中用 `gh release download` 或直接请求 `https://github.com/android-security-engineer/VirtualXposed-skills/releases/latest/download/` 获取最新 APK。

下载后在 Android 5.0~10.0 设备上直接安装（已签名，arm64-v8a / x86_64）。
```

- [ ] **Step 4: 在 llms.txt 追加 Release 下载链接 — 供 Agent 抓取**
文件: `website/public/llms.txt`（"## 结构化数据"章节之前插入新章节）

```text
## 预编译 APK（免源码编译）

- [GitHub Releases](https://github.com/android-security-engineer/VirtualXposed-skills/releases): 已签名的 VirtualXposed APK（arm64-v8a / x86_64，Android 5.0~10.0），Agent 可用 gh release download 直接获取
- [源码构建文档](https://android-security-engineer.github.io/VirtualXposed-skills/dev/build): 从源码编译安装的完整步骤
```

- [ ] **Step 5: 在 for-agents.md 追加 Release 下载章节 — Agent 对接的产物获取入口**
文件: `website/dev/for-agents.md`（"## 第四层"章节之后、"## 快速对接清单"之前插入新章节）

```markdown
## 第五层：预编译 APK 下载（Agent 获取可安装产物）

VirtualXposed 以 **APK** 形式分发。Agent 无需从源码编译，可直接下载已签名的 Release：

下载命令：`gh release download --repo android-security-engineer/VirtualXposed-skills --pattern '*.apk' --dir .`

或直接请求 latest release URL：`https://github.com/android-security-engineer/VirtualXposed-skills/releases/latest`

- APK 已签名，支持 arm64-v8a / x86_64，安装于 Android 5.0~10.0
- 需从源码编译时见 [/dev/build](./build)（含 jcenter 镜像、NDK r19c、keystore 配置）
- CI 流水线：`android.yml`（构建验证）+ `release.yml`（tag 触发发布）
```

- [ ] **Step 6: 验证文档站构建零死链**
Run: `cd website && pnpm build 2>&1 | tail -5`
Expected:
  - Exit code: 0
  - Output contains: "build complete"
  - Output does NOT contain: "dead link" or "Error"

- [ ] **Step 7: 提交**
Run: `git add website/dev/build.md website/public/llms.txt website/dev/for-agents.md && git commit -m "docs(build): document CI signing setup, jcenter mirror, and APK release download

- Rewrite build.md CI section to reflect new android.yml/release.yml
- Add signing key configuration (GitHub Secrets) section
- Add 'download prebuilt APK' section for agents/users
- Add release download link to llms.txt and for-agents.md

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"`

---

### Task 6: 扩展 virtualxposed skill — 加"获取预编译 APK"工具

**Depends on:** Task 5
**Files:**
- Modify: `.claude/skills/virtualxposed/SKILL.md`（追加工具 D）
- Modify: `.claude/skills/virtualxposed/reference.md`（追加 Release 下载速查）

- [ ] **Step 1: 在 SKILL.md 追加工具 D — 获取预编译 APK**
文件: `.claude/skills/virtualxposed/SKILL.md`（"## 三类工具操作"章节标题改为四类，并在工具 C 之后追加工具 D）

```markdown
### 工具 D：获取预编译 APK

当用户问"怎么安装 VirtualXposed"、"下载 APK"、"不要从源码编译"：
1. 说明 VirtualXposed 以 APK 形式分发，无需源码编译
2. 提供下载命令：`gh release download --repo android-security-engineer/VirtualXposed-skills --pattern '*.apk' --dir .`
3. 或指向 latest release 页面：`https://github.com/android-security-engineer/VirtualXposed-skills/releases/latest`
4. 说明 APK 已签名、支持 arm64-v8a/x86_64、Android 5.0~10.0
5. 若用户需从源码编译，指引 `/dev/build` 文档（含 jcenter 镜像、NDK r19c、keystore）
```

- [ ] **Step 2: 在 reference.md 追加 Release 下载速查表**
文件: `.claude/skills/virtualxposed/reference.md`（"## 5. 查询示例"章节之后追加新章节）

```markdown
## 6. 预编译 APK 下载速查

VirtualXposed 以 APK 分发，Agent 可直接下载无需编译：

| 需求 | 命令/URL |
|------|---------|
| 下载最新 APK | `gh release download --repo android-security-engineer/VirtualXposed-skills --pattern '*.apk'` |
| latest release 页面 | https://github.com/android-security-engineer/VirtualXposed-skills/releases/latest |
| 源码编译文档 | /dev/build（jcenter 阿里云镜像 + NDK r19c + keystore 配置） |
| CI 构建流水线 | .github/workflows/android.yml（构建）+ release.yml（tag 触发发布） |

APK 已签名，arm64-v8a / x86_64，Android 5.0~10.0。versionName 0.22.0 / versionCode 220。
```

- [ ] **Step 3: 验证 skill 文件更新**
Run: `grep -q "工具 D：获取预编译 APK" .claude/skills/virtualxposed/SKILL.md && grep -q "预编译 APK 下载速查" .claude/skills/virtualxposed/reference.md && echo OK`
Expected:
  - Exit code: 0
  - Output contains: "OK"

- [ ] **Step 4: 提交**
Run: `git add .claude/skills/virtualxposed/SKILL.md .claude/skills/virtualxposed/reference.md && git commit -m "feat(skill): add prebuilt-APK download tool to virtualxposed skill

Tool D guides agents to download signed APK from GitHub Releases
(gh release download) instead of building from source. Adds release
download quick-reference table.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"`

---

## 执行记录（2026-07-14，实际落地偏差）

6 个 Task 全部完成并推送。T1（jcenter 阿里云镜像）、T4（keystore 脚本）、T5（文档）、T6（skill）按 Plan 原样落地。**T2/T3 的 android.yml / release.yml 在 CI 实测中远比 Plan 写的复杂**，经过 6 轮迭代修复才让 AGP 3.2.1 老栈在 ubuntu-latest 上跑通。最终落地的 SDK 安装方案与 Plan Step 1 写的"`android-actions/setup-android@v3`"截然不同：

**实际落地的 `Set up Android SDK components` step（取代 Plan 中的 setup-android action）**：
- 不用 `android-actions/setup-android`（v3/v4 都在 runner 上崩，报 "Wrong version in preinstalled sdkmanager"）
- 不复用 runner 预装 SDK（含 android-34+ 新 schema XML，AGP 3.2.1 旧 sdklib 解析崩 `NumberFormatException: 34x`）
- 改为：建干净独立 `ANDROID_HOME=$HOME/vxp-android-sdk`，用 runner 的 `sdkmanager --sdk_root=$CUSTOM_SDK` 只装 2018 同代三件套（build-tools;28.0.3 / platforms;android-28 / ndk;19.2.5345600）
- sdkmanager 用 Java 17 跑（runner 预装 `/usr/lib/jvm/*17*`），gradle 用 setup-java 的 Java 8
- `ANDROID_HOME`/`ANDROID_SDK_ROOT`/`ANDROID_NDK_HOME`（指向 r19c 老布局）经 `$GITHUB_ENV` 暴露给 gradle step
- Decode keystore step：secret 经 `env:` 传入 + shell 内 `[ -z ]` 判断（**不能在 `if:` 里用 secrets 上下文**，会导致 workflow 文件级 0s 失败）

**CI 结果**：`BUILD SUCCESSFUL in 2m49s`（aosp，含 native ndkBuild）+ 21s（fdroid），产出 `app-aosp-release-unsigned.apk`（7.3MB）与 `app-fdroid-release-unsigned.apk`（7.2MB），上传为 artifact `virtualxposed-apk`。**当前 APK 未签名**（4 个 `VXP_*` Secret 尚未配置，降级模式）；配置后推 `v*` tag 即触发 release.yml 发签名 APK。

**剩余人工步骤（不属代码改动）**：用户本地跑 `./scripts/generate-keystore.sh release.jks`，把输出的 4 个值填入 GitHub Secrets，然后 `git tag v0.22.1 && git push origin v0.22.1` 触发首个签名 Release。

详见记忆 `vxp-ci-android-legacy-stack-gotchas`（6 层坑完整记录）与 `vxp-release-signing-secrets`（Secret 配置）。

