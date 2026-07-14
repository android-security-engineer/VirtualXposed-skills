# VirtualXposed 文档站主体入库与部署修复 Plan

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development`
> Steps use checkbox (`- [ ]`) syntax.

**Goal:** 把 VirtualXposed 文档站从未入库的 350 个文件（含 package.json/pnpm-lock.yaml 构建基建 + 189 篇正文 Markdown + docs 计划）全部纳入 git，修复上一轮推送后 CI 无法部署、Agent 链接大面积 404 的部署级阻断，并清理一个误入 Java 源码目录的 .vitepress 构建异物。

**Architecture:** 纯文件入库工作流。调研已确认：350 个文件均已存在本地且内容真实（抽样 guide 72 行/architecture 139 行/proxies 78 行），从未 `git add`（非 .gitignore 误伤，`git check-ignore` 已证实）；config.mts 的 161 个 link 全部对应真实文件（10 个尾斜杠 link 对应 index.md，cleanUrls 会解析），无真死链；只需按模块分批 `git add` → `git commit` → 末尾用脚本扫描 config.mts 全部 link 逐一校验入库 → `pnpm build` + `--frozen-lockfile` 模拟 CI 验证。分批提交保证 diff 可追溯，无任何文件内容改动。

**Tech Stack:** Git, VitePress 1.6.4, pnpm 10, Node 22（CI 已定）

**Risks:**
- 350 文件一次提交 diff 过大不可追溯 → 缓解：按 5 个模块分批 commit，每批独立可验证
- `pnpm-lock.yaml` 入库后 CI `--frozen-lockfile` 可能因 lock 与 package 不同步失败 → 缓解：Task 1 先本地跑 `pnpm install --frozen-lockfile` 确认通过
- 个别 link 可能在我分批校验时仍指向未入库文件 → 缓解：Task 5 用脚本对 config.mts 全部 161 link 逐一 `git ls-files` 校验入库，列出缺失
- `.vitepress/dist` 构建异物误入库 → 缓解：Task 5 校验阶段确认 `git ls-files` 不含任何 `.vitepress/dist` 路径
- `docs/` 含 superpowers plan，是否该入库 → 决策：入库（项目工作产物，CLAUDE.md 未声明忽略）

---

### Task 1: 入库构建基建文件（package.json + lockfile + .gitignore + logo）

**Depends on:** None
**Files:**
- Commit: `website/package.json`
- Commit: `website/pnpm-lock.yaml`
- Commit: `website/.gitignore`
- Commit: `website/public/logo.svg`

- [ ] **Step 1: 验证 lockfile 与 package.json 同步 — 跑 frozen-lockfile 安装**
Run: `cd website && pnpm install --frozen-lockfile 2>&1 | tail -5`
Expected:
  - Exit code: 0
  - Output does NOT contain: "ERR_PNPM" or "lockfile" 与 "mismatch" 同行
  - Output contains: "Progress" 或 "Done" 或无报错完成

- [ ] **Step 2: 入库构建基建 4 文件 — 让 CI 能 install + 有站点 logo**
Run: `git add website/package.json website/pnpm-lock.yaml website/.gitignore website/public/logo.svg && git status --short website/package.json website/pnpm-lock.yaml website/.gitignore website/public/logo.svg`
Expected:
  - 第二条 `git status` 无输出（已全部暂存，从 untracked 变 staged）
  - Exit code: 0

- [ ] **Step 3: 提交构建基建**
Run: `git commit -m "chore(website): commit build base (package.json, lockfile, .gitignore, logo)

Previously never tracked; blocks CI pnpm install --frozen-lockfile.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"`
Expected:
  - Exit code: 0
  - Output contains: "4 files changed" 或 "3 files" (logo 若已入库则 3)

- [ ] **Step 4: 验证 4 文件已入库**
Run: `git ls-files website/package.json website/pnpm-lock.yaml website/.gitignore website/public/logo.svg | wc -l`
Expected:
  - Exit code: 0
  - Output contains: "4" 或 "3"

---

### Task 2: 入库导航与原理文档（guide + architecture + features + xposed + dev）

**Depends on:** Task 1
**Files:**
- Commit: `website/guide/*.md`（4 篇）
- Commit: `website/architecture/*.md`（3 篇）
- Commit: `website/features/*.md`（11 篇）
- Commit: `website/xposed/*.md`（4 篇）
- Commit: `website/dev/build.md`, `website/dev/docs-site.md`（2 篇）

- [ ] **Step 1: 入库 5 个目录的全部正文 Markdown — 让首页与导航栏链接不再 404**
Run: `git add website/guide/ website/architecture/ website/features/ website/xposed/ website/dev/build.md website/dev/docs-site.md && git diff --cached --stat | tail -3`
Expected:
  - Exit code: 0
  - `--stat` 末行显示新增文件数 ≥ 20（4+3+11+4+2=24）

- [ ] **Step 2: 提交导航与原理文档**
Run: `git commit -m "docs(site): commit guide/architecture/features/xposed/dev content

24 navigation & principle docs previously untracked; fixes 404 on
homepage CTA links and nav bar.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"`
Expected:
  - Exit code: 0
  - Output contains: "24 files changed" 或相近数

- [ ] **Step 3: 验证导航类文档全部入库**
Run: `echo "guide=$(git ls-files website/guide/ | wc -l) arch=$(git ls-files website/architecture/ | wc -l) feat=$(git ls-files website/features/ | wc -l) xposed=$(git ls-files website/xposed/ | wc -l) dev=$(git ls-files website/dev/ | wc -l)"`
Expected:
  - Exit code: 0
  - guide=4, arch=3, feat=11, xposed=4, dev（含 for-agents.md）≥3

---

### Task 3: 入库 reference/proxies + client + helper + server + native + remote（六大模块正文）

**Depends on:** Task 2
**Files:**
- Commit: `website/reference/index.md`
- Commit: `website/reference/proxies/*.md`（46 篇）
- Commit: `website/reference/client/**/*.md`（36 篇）
- Commit: `website/reference/helper/**/*.md`（37 篇）
- Commit: `website/reference/server/**/*.md`（28 篇）
- Commit: `website/reference/native/*.md`（4 篇）
- Commit: `website/reference/remote/*.md`（12 篇）

- [ ] **Step 1: 入库 reference 非 mirror 部分 — proxies/client/helper/server/native/remote 与顶层 index**
Run: `git add website/reference/index.md website/reference/proxies/ website/reference/client/ website/reference/helper/ website/reference/server/ website/reference/native/ website/reference/remote/ && git diff --cached --stat | tail -3`
Expected:
  - Exit code: 0
  - `--stat` 末行新增文件数 ≥ 130（46+36+37+28+4+12+1≈164，部分已入库的 native/remote/server 会去重）

- [ ] **Step 2: 提交 reference 六大模块正文**
Run: `git commit -m "docs(reference): commit proxies/client/helper/server/native/remote docs

~164 source reference docs previously untracked; completes the
48-service-proxy + virtual-service + client-framework reference layer.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"`
Expected:
  - Exit code: 0
  - Output contains: "files changed"

- [ ] **Step 3: 验证 reference 非镜像部分入库数**
Run: `for d in proxies client helper server native remote; do echo "$d: $(git ls-files website/reference/$d/ | wc -l)"; done`
Expected:
  - Exit code: 0
  - proxies ≥ 46, client ≥ 36, helper ≥ 37, server ≥ 28, native = 9, remote = 12（含已入库的）

---

### Task 4: 入库 reference/mirror 镜像类文档（mirror 子包 + classes 逐类文档，共 155 篇）

**Depends on:** Task 3
**Files:**
- Commit: `website/reference/mirror/index.md` + `mirror-*.md`（12 篇）
- Commit: `website/reference/mirror/classes/index.md` + `classes/*.md`（143 篇）

- [ ] **Step 1: 入库 mirror 子包文档 — mirror 总览与 12 个子包镜像文档**
Run: `git add website/reference/mirror/index.md website/reference/mirror/mirror-*.md && git diff --cached --stat -- website/reference/mirror/ | tail -3`
Expected:
  - Exit code: 0
  - `--stat` 显示新增约 12 个文件（mirror-content/mirror-app/mirror-os/mirror-view/mirror-telephony/mirror-net/mirror-media/mirror-location/mirror-hardware/mirror-misc/mirror-ref-framework + index）

- [ ] **Step 2: 提交 mirror 子包文档**
Run: `git commit -m "docs(mirror): commit mirror sub-package docs (12 files)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"`
Expected:
  - Exit code: 0
  - Output contains: "12 files changed" 或相近

- [ ] **Step 3: 入库 mirror/classes 逐类文档 — 144 影子类的逐类解析（143 篇 + index）**
Run: `git add website/reference/mirror/classes/ && git diff --cached --stat -- website/reference/mirror/classes/ | tail -3`
Expected:
  - Exit code: 0
  - `--stat` 显示新增约 143 个文件

- [ ] **Step 4: 提交 mirror/classes 逐类文档**
Run: `git commit -m "docs(mirror): commit 143 per-class mirror reference docs

The largest untracked batch: one doc per mirrored Android hidden-API class.
Completes the full 481-class reference surface.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"`
Expected:
  - Exit code: 0
  - Output contains: "143 files changed"

- [ ] **Step 5: 验证 mirror 全量入库**
Run: `echo "mirror 顶层: $(git ls-files website/reference/mirror/ | grep -v '/classes/' | wc -l)  classes: $(git ls-files website/reference/mirror/classes/ | wc -l)"`
Expected:
  - Exit code: 0
  - classes = 144（143 + index.md）, mirror 顶层 = 13

---

### Task 5: 清理异物 + docs 计划入库 + config.mts 死链全量校验 + 模拟 CI 构建

**Depends on:** Task 1, Task 2, Task 3, Task 4
**Files:**
- Delete: `VirtualApp/lib/src/main/java/com/lody/virtual/server/pm/installer/.vitepress/`（构建异物，误入 Java 源码目录）
- Commit: `docs/superpowers/plans/*.md`（3 篇计划文档）
- Create: `website/scripts/check-deadlinks.mjs`（config.mts link 入库校验脚本）

- [ ] **Step 1: 清理误入 Java 源码目录的 .vitepress 构建异物 — 该目录是某次 build 输出路径错误产物，不属于源码**
Run: `rm -rf "VirtualApp/lib/src/main/java/com/lody/virtual/server/pm/installer/.vitepress" && test ! -e "VirtualApp/lib/src/main/java/com/lody/virtual/server/pm/installer/.vitepress" && echo CLEANED`
Expected:
  - Exit code: 0
  - Output contains: "CLEANED"

- [ ] **Step 2: 创建 check-deadlinks.mjs — 扫描 config.mts 全部 link，校验对应文件已入库**
Run: `cat > website/scripts/check-deadlinks.mjs << 'SCRIPT'
// 扫描 config.mts 中所有 link: '/...' 路径，校验对应 .md 已入库（git ls-files）。
// cleanUrls: /reference/ → /reference/index.md；/reference/proxies/account → .../account.md
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
const cfg = readFileSync('website/.vitepress/config.mts', 'utf8');
const links = [...cfg.matchAll(/link:\s*'([^']+)'/g)].map(m => m[1]);
const tracked = new Set(execSync('git ls-files website/', {encoding:'utf8'}).split('\n').filter(Boolean));
let missing = [];
for (const p of links) {
  const candidates = [
    'website' + p + '.md',
    p.endsWith('/') ? 'website' + p + 'index.md' : null,
    p.endsWith('/') ? 'website' + p.slice(0,-1) + '.md' : null,
  ].filter(Boolean);
  if (!candidates.some(c => tracked.has(c))) missing.push(p);
}
console.log('config.mts links: ' + links.length);
console.log('missing (untracked or absent): ' + missing.length);
if (missing.length) { console.log('MISSING:\n' + missing.join('\n')); process.exit(1); }
console.log('ALL LINKS TRACKED');
SCRIPT
node website/scripts/check-deadlinks.mjs`
Expected:
  - Exit code: 0
  - Output contains: "ALL LINKS TRACKED"
  - Output contains: "missing (untracked or absent): 0"

- [ ] **Step 3: 入库 docs 计划目录 — 含本 Plan 与前序两轮 Plan，属项目工作产物**
Run: `git add docs/ && git diff --cached --stat -- docs/ | tail -3`
Expected:
  - Exit code: 0
  - `--stat` 显示新增 3 个 .md（2026-07-07/08/14 三份 Plan）

- [ ] **Step 4: 入库 check-deadlinks 脚本并提交 docs + 脚本**
Run: `git add website/scripts/check-deadlinks.mjs && git commit -m "docs: commit planning docs and add config.mts deadlink checker

- Track docs/superpowers/plans/ (3 plan files)
- Add website/scripts/check-deadlinks.mjs to verify all config.mts
  sidebar links resolve to tracked files (CI deploy safety)
- Remove .vitepress build artifact misplaced in Java source tree

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"`
Expected:
  - Exit code: 0
  - Output contains: "files changed"

- [ ] **Step 5: 最终全量验证 — 确认无构建异物入库 + pnpm build 通过 + 死链校验通过**
Run: `echo "=== 构建异物未入库? ===" && (git ls-files | grep -c 'server/pm/installer/.vitepress' | grep -q '^0$' && echo "OK no artifact tracked" || echo "BAD"); echo "=== 死链校验 ===" && node website/scripts/check-deadlinks.mjs | tail -1; echo "=== pnpm build ===" && cd website && pnpm build 2>&1 | tail -3`
Expected:
  - Exit code: 0
  - Output contains: "OK no artifact tracked"
  - Output contains: "ALL LINKS TRACKED"
  - pnpm build 输出包含: "build complete" 且不含 "dead link" / "Error"

- [ ] **Step 6: 提交（本 Task 已在 Step 4 提交，此 Step 仅确认工作区干净）**
Run: `git status --short | grep -E '^\?\? ' | grep -vE 'node_modules|dist' | wc -l | xargs echo "剩余未跟踪(排除node_modules/dist):"`
Expected:
  - Exit code: 0
  - 数字为 0（全部入库）或仅剩不应入库的本地文件
