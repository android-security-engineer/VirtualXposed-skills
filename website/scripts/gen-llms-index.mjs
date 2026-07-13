// website/scripts/gen-llms-index.mjs
// 静态扫描 VirtualApp/lib/src 下的 Java 源码，生成供 AI Agent 检索的结构化索引。
// 输出 website/public/llms-index.json：类→源码文件→模块→文档链接的映射。
// 纯静态扫描，无需运行 Android，不依赖 launcher submodule。

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const LIB_SRC = 'VirtualApp/lib/src/main/java/com/lody/virtual';
const OUTPUT = 'website/public/llms-index.json';
const REPO_BASE = 'https://github.com/android-security-engineer/VirtualXposed-skills/blob/vxp';

// 模块 → 文档链接映射（从 config.mts sidebar 真实抽取）
const MODULE_DOC = {
  'client/hook/proxies': '/reference/proxies/',
  'client': '/reference/client/',
  'server': '/reference/server/',
  'mirror': '/reference/mirror/',
  'helper': '/reference/helper/',
  'remote': '/reference/remote/',
  'os': '/reference/helper/',
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

async function walkJava(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...await walkJava(full));
    } else if (entry.name.endsWith('.java')) {
      out.push(full);
    }
  }
  return out;
}

function parseClass(src) {
  // 提取 package 与首个 public class/interface 名
  const pkgMatch = src.match(/^package\s+([\w.]+);/m);
  const clsMatch = src.match(/public\s+(?:final\s+|abstract\s+)?(?:class|interface|enum)\s+(\w+)/);
  return {
    package: pkgMatch ? pkgMatch[1] : '',
    className: clsMatch ? clsMatch[1] : '',
  };
}

async function main() {
  const files = await walkJava(LIB_SRC);
  const entries = [];
  for (const abs of files) {
    const relToVirtual = relative(LIB_SRC, abs); // client/hook/proxies/account/AccountStub.java
    const relToRepo = relative('.', abs);        // VirtualApp/lib/src/main/java/com/lody/virtual/client/...
    const src = await readFile(abs, 'utf8');
    const { package: pkg, className } = parseClass(src);
    const module = classifyModule(relToVirtual);
    entries.push({
      className,
      package: pkg,
      module,
      sourcePath: relToRepo,
      sourceUrl: `${REPO_BASE}/${relToRepo}`,
      docLink: MODULE_DOC[module] || null,
    });
  }
  // 去掉解析不到类名的（极少数匿名/内部类顶级文件）
  const valid = entries.filter(e => e.className);
  const index = {
    generatedFrom: 'VirtualApp/lib/src/main/java/com/lody/virtual',
    fileCount: valid.length,
    moduleCount: [...new Set(valid.map(e => e.module))].length,
    modules: MODULE_DOC,
    classes: valid,
  };
  await writeFile(OUTPUT, JSON.stringify(index, null, 2), 'utf8');
  const sizeKB = Math.round(JSON.stringify(index).length / 1024);
  console.log(`Generated ${OUTPUT}: ${valid.length} classes, ${index.moduleCount} modules, ${sizeKB} KB`);
  if (sizeKB > 2048) {
    console.warn('WARN: index > 2MB, consider sharding by module');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
