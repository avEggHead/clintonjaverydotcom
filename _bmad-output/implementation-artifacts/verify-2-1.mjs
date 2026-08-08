// Story 2.1 faithful-preservation verifier (provenance, not shipped).
// Compares the word MULTISET of each migrated .mdx body against the original
// posts.tsx content (recovered from git HEAD). Differs only by non-word
// markdown tokens (code-fence ```, inline-code `, line-continuation \), which
// the tokenizer drops. Any missing/added real word surfaces as a failure.

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('clintonjavery');
const oldText = execSync('git show HEAD:clintonjavery/src/data/posts.tsx', { encoding: 'utf8' });

const meta = {
  'ApertusOpenSourceLLM': 'apertus-open-source-llm',
  'TwoPowershellCommandsofDomainTransfer': 'two-powershell-commands-of-domain-transfer',
  'Run a model locally to save tons of money': 'run-a-model-locally',
  'triple dt software engineering framework': 'triple-dt-software-engineering-framework',
  'dialogues with the robot troubleshooting': 'dialogues-with-the-robot',
  'creating a package': 'creating-a-package',
  'making things harder': 'making-things-harder',
  'Security and obscurity': 'security-and-obscurity',
  'books are good': 'books-are-good',
  'The paradoxical necessity': 'two-mindsets-of-engineering',
  'The dreaded on-call support rotation': 'three-concepts-for-support',
  'mass migration from the cloud': 'mass-migration-from-the-cloud',
  'tech improvments are only goood if they save money': 'values-beyond-the-bottom-line',
  "Where's the bottleneck": 'does-genai-remove-the-bottleneck',
  'bicycle-or-wheelchair': 'bicycle-or-wheelchair',
};

const re =
  /\{\s*slug:\s*"([^"]*)"\s*,\s*title:\s*"([^"]*)"\s*,\s*date:\s*"([^"]*)"\s*,\s*preview:\s*"([^"]*)"\s*,\s*content\s*:\s*`([\s\S]*?)`\s*,?\s*\n\s*\},?/g;

// Tokenize: split on non-word chars, lowercase, drop empties.
function tokens(s) {
  return s.toLowerCase().split(/[^0-9a-z_]+/).filter(Boolean);
}

function multiset(arr) {
  const m = new Map();
  for (const t of arr) m.set(t, (m.get(t) || 0) + 1);
  return m;
}

function diffMaps(oldM, newM) {
  const missing = []; // words in original but not (or fewer) in new
  const added = [];
  const all = new Set([...oldM.keys(), ...newM.keys()]);
  for (const w of all) {
    const o = oldM.get(w) || 0, n = newM.get(w) || 0;
    if (o > n) missing.push(`${w} (-${o - n})`);
    if (n > o) added.push(`${w} (+${n - o})`);
  }
  return { missing, added };
}

let m, fails = 0, checked = 0;
while ((m = re.exec(oldText)) !== null) {
  const [, oldSlug] = m;
  const content = m[5];
  const newSlug = meta[oldSlug];
  if (!newSlug) { console.log('NO MAP for', oldSlug); fails++; continue; }
  const file = path.join(ROOT, 'content/p', newSlug + '.mdx');
  const mdx = fs.readFileSync(file, 'utf8');
  // strip frontmatter (between first two --- lines)
  const body = mdx.replace(/^---\n[\s\S]*?\n---\n/, '');
  const oldT = multiset(tokens(content));
  const newT = multiset(tokens(body));
  const { missing, added } = diffMaps(oldT, newT);
  checked++;
  if (missing.length || added.length) {
    fails++;
    console.log(`MISMATCH ${oldSlug} -> ${newSlug}`);
    if (missing.length) console.log('  missing in new:', missing.slice(0, 20).join(', '));
    if (added.length) console.log('  added in new:', added.slice(0, 20).join(', '));
  } else {
    console.log(`OK   ${oldSlug} -> ${newSlug} (${oldT.size} distinct words)`);
  }
}
console.log(`\nChecked ${checked} posts, ${fails} mismatch(es).`);
process.exit(fails ? 1 : 0);