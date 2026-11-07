// pstack-pi オフライン検証。Pi 本体を起動せずに、Agent Skills 仕様
// （https://agentskills.io/specification）と Pi の発見規則against の整合を確認する:
//   - skills/ 直下の各ディレクトリに SKILL.md があり、name/description が仕様内
//   - name は英小数字・ハイフン、前後/連続ハイフンなし、64 文字以内
//   - description は 1024 文字以内
//   - setup-pstack は同梱していない（Pi 版は同期時除外）
//   - pstack-harness（当ポート追加）だけがモデル発火可能で、上流由来は全数
//     disable-model-invocation: true のまま
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('..', import.meta.url).pathname;
const skillsDir = join(root, 'skills');

const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FRONTMATTER_RE = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(\r?\n|$)/;
const TRUTHY = new Set(['true', 'yes', 'on', '1']);
const FALSY = new Set(['false', 'no', 'off', '0']);

function parseScalar(raw) {
  if (raw.startsWith('"')) {
    try { return JSON.parse(raw); } catch { return raw.slice(1); }
  }
  if (raw.startsWith("'")) {
    const end = raw.lastIndexOf("'");
    if (end > 0) return raw.slice(1, end).replace(/''/g, "'");
    return raw.slice(1);
  }
  return raw;
}

function parseFrontmatter(text) {
  const lines = text.split(/\r?\n/);
  const out = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '' || /^\s/.test(line) || line.trimStart().startsWith('#')) { i += 1; continue; }
    const m = /^([A-Za-z0-9_][A-Za-z0-9_-]*):(.*)$/.exec(line);
    if (!m) { i += 1; continue; }
    const key = m[1];
    const block = /^\s*([|>])([+-]?)\d*\s*$/.exec(m[2]);
    if (block) {
      const style = block[1];
      const chomp = block[2];
      const body = [];
      let j = i + 1;
      while (j < lines.length && (lines[j].trim() === '' || /^\s/.test(lines[j]))) { body.push(lines[j]); j += 1; }
      let indent = Infinity;
      for (const l of body) if (l.trim() !== '') indent = Math.min(indent, /^\s*/.exec(l)[0].length);
      if (!Number.isFinite(indent)) indent = 0;
      const stripped = body.map((l) => (l.trim() === '' ? '' : l.slice(indent)));
      while (stripped.length > 0 && stripped[stripped.length - 1] === '') stripped.pop();
      out[key] = style === '|' ? stripped.join('\n') + (chomp !== '-' ? '\n' : '')
                               : stripped.join(' ').replace(/ \n/g, '\n') + (chomp !== '-' ? '\n' : '');
      i = j;
      continue;
    }
    out[key] = parseScalar(m[2].trim());
    i += 1;
  }
  return out;
}

function toBoolean(value) {
  const lowered = String(value).trim().toLowerCase();
  if (TRUTHY.has(lowered)) return true;
  if (FALSY.has(lowered)) return false;
  return undefined;
}

const errors = [];
const dirs = (await readdir(skillsDir, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name).sort();
const seen = new Map();
let modelInvocable = [];

for (const dir of dirs) {
  const path = join(skillsDir, dir, 'SKILL.md');
  let raw;
  try {
    raw = await readFile(path, 'utf8');
  } catch {
    errors.push(`${dir}: SKILL.md がありません`);
    continue;
  }
  const fm = FRONTMATTER_RE.exec(raw);
  if (!fm) { errors.push(`${dir}: frontmatter がありません`); continue; }
  const meta = parseFrontmatter(fm[1]);
  const where = `${dir} (${path})`;

  if (typeof meta.name !== 'string' || meta.name === '') { errors.push(`${where}: name 欠落`); continue; }
  if (!NAME_RE.test(meta.name)) errors.push(`${where}: name '${meta.name}' が仕様外`);
  if (meta.name.length > 64) errors.push(`${where}: name が ${meta.name.length} 文字（>64）`);
  if (typeof meta.description !== 'string' || meta.description.trim() === '') { errors.push(`${where}: description 欠落`); continue; }
  if (meta.description.length > 1024) errors.push(`${where}: description が ${meta.description.length} 文字（>1024）`);
  if (meta['disable-model-invocation'] !== undefined && toBoolean(meta['disable-model-invocation']) === undefined) {
    errors.push(`${where}: disable-model-invocation '${meta['disable-model-invocation']}' が真偽値として不正`);
  }

  if (seen.has(meta.name)) errors.push(`${where}: name '${meta.name}' が ${seen.get(meta.name)} と衝突`);
  seen.set(meta.name, dir);
  if (toBoolean(meta['disable-model-invocation']) !== true) modelInvocable.push(meta.name);
}

// ポート固有の不変条件
if (dirs.includes('setup-pstack')) errors.push('setup-pstack が同梱されている（Pi 版では除外対象）');
if (!seen.has('pstack-harness')) errors.push('pstack-harness（当ポート追加のハーネスキル）がありません');
const expectedModelInvocable = ['pstack-harness'];
if (JSON.stringify(modelInvocable.slice().sort()) !== JSON.stringify(expectedModelInvocable)) {
  errors.push(`モデル発火可能スキルが想定外: ${JSON.stringify(modelInvocable.sort())}（想定 ${JSON.stringify(expectedModelInvocable)}）`);
}

console.log(`skills: ${dirs.length}  (upstream由来 ${dirs.length - 1} + pstack-harness)`);
if (errors.length > 0) {
  for (const e of errors) console.error(`FAIL ${e}`);
  process.exit(1);
}
console.log('OK');
