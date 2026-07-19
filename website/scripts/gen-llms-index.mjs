// website/scripts/gen-llms-index.mjs
// 静态扫描 VirtualApp/lib/src 下的 Java 源码，生成供 AI Agent 检索的结构化索引。
// 输出 website/public/llms-index.json：类→源码文件→模块→文档链接的映射。
// 纯静态扫描，无需运行 Android，不依赖 launcher submodule。

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const VIRTUAL_SRC = 'VirtualApp/lib/src/main/java/com/lody/virtual';
const MIRROR_SRC = 'VirtualApp/lib/src/main/java/mirror';
const JNI_SRC = 'VirtualApp/lib/src/main/jni';
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

function parseClass(src) {
  // 提取 package 与首个顶级 class/interface/enum 名（不强制 public，兼容包级私有类如 GPSStateline）
  const pkgMatch = src.match(/^package\s+([\w.]+);/m);
  const clsMatch = src.match(/(?:public\s+|final\s+|abstract\s+|static\s+)*\b(?:class|interface|enum)\s+(\w+)/);
  return {
    package: pkgMatch ? pkgMatch[1] : '',
    className: clsMatch ? clsMatch[1] : '',
  };
}

async function main() {
  // Java: virtual + mirror 两个根（mirror 在 com/lody/mirror，不在 virtual 下）
  const virtualFiles = await walkJava(VIRTUAL_SRC);
  const mirrorFiles = await walkJava(MIRROR_SRC);
  const javaEntries = [];
  // virtual 根的文件按子目录分 module；mirror 根的文件统一归 'mirror'
  for (const abs of virtualFiles) {
    const relToRoot = relative(VIRTUAL_SRC, abs);
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
  for (const abs of mirrorFiles) {
    const relToRepo = relative('.', abs);
    const src = await readFile(abs, 'utf8');
    const { package: pkg, className } = parseClass(src);
    javaEntries.push({
      className,
      package: pkg,
      module: 'mirror',
      sourcePath: relToRepo,
      sourceUrl: `${REPO_BASE}/${relToRepo}`,
      docLink: MODULE_DOC['mirror'],
    });
  }
  const validJava = javaEntries.filter(e => e.className);

  // Native: jni 目录，按文件索引（不解析 C++ 类，超出范围）
  const nativeFiles = await walkNative(JNI_SRC);
  const nativeEntries = nativeFiles.map(abs => {
    const relToRepo = relative('.', abs);
    return {
      fileName: abs.split('/').pop(),
      sourcePath: relToRepo,
      sourceUrl: `${REPO_BASE}/${relToRepo}`,
    };
  });

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
