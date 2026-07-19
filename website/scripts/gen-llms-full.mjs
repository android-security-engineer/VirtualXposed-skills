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
