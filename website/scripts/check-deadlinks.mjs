// 扫描 config.mts 中所有 link: '/...' 路径，校验对应 .md 已入库（git ls-files）。
// cleanUrls: /reference/ → /reference/index.md；/reference/proxies/account → .../account.md
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
const cfg = readFileSync('website/.vitepress/config.mts', 'utf8');
const links = [...cfg.matchAll(/link:\s*'\/([^']+)'/g)].map(m => '/' + m[1]);
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
