// Story 2.1 migration helper (provenance, not shipped).
// Reads clintonjavery/src/data/posts.tsx, extracts the 15 essay records,
// and writes normalized .mdx files to clintonjavery/content/p/<new-slug>.mdx.
//
// Normalization rules (preserve every word; only whitespace + code-fencing change):
//   - Each source line => its own markdown paragraph (blank-line separated),
//     matching the old Post.tsx `whiteSpace: pre-wrap` line-by-line render.
//   - Leading author-side indentation is stripped (avoid md 4-space code blocks).
//   - Contiguous "code-y" lines (contain `{`/`}` or a `<tag>`-like angle, or start
//     with a known shell/PowerShell token) are wrapped in a fenced ``` block so
//     MDX does not parse `{`, `}`, `<…>` as JSX (build-breaker).
//   - Bare URLs stay bare (matches the old non-clickable pre-wrap rendering).
//   - Per-line em-dashes/en-dashes/superscripts saved verbatim.
//
// Posts 2 & 3 are written here then hand-finished (post 3 step-9 URL inline-coded,
// post 2 caption polish) — but the fenced-code detection below already keeps the
// build green.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('clintonjavery');
const SRC = path.join(ROOT, 'src/data/posts.tsx');
const OUT = path.join(ROOT, 'content/p');
const text = fs.readFileSync(SRC, 'utf8');

// oldSlug -> { newSlug, isoDate }
const meta = {
  'ApertusOpenSourceLLM': { newSlug: 'apertus-open-source-llm', iso: '2026-05-18' },
  'TwoPowershellCommandsofDomainTransfer': { newSlug: 'two-powershell-commands-of-domain-transfer', iso: '2026-04-23' },
  'Run a model locally to save tons of money': { newSlug: 'run-a-model-locally', iso: '2026-04-02' },
  'triple dt software engineering framework': { newSlug: 'triple-dt-software-engineering-framework', iso: '2026-02-09' },
  'dialogues with the robot troubleshooting': { newSlug: 'dialogues-with-the-robot', iso: '2025-06-09' },
  'creating a package': { newSlug: 'creating-a-package', iso: '2025-05-21' },
  'making things harder': { newSlug: 'making-things-harder', iso: '2025-05-08' },
  'Security and obscurity': { newSlug: 'security-and-obscurity', iso: '2025-05-02' },
  'books are good': { newSlug: 'books-are-good', iso: '2025-04-28' },
  'The paradoxical necessity': { newSlug: 'two-mindsets-of-engineering', iso: '2025-04-22' },
  'The dreaded on-call support rotation': { newSlug: 'three-concepts-for-support', iso: '2025-04-17' },
  'mass migration from the cloud': { newSlug: 'mass-migration-from-the-cloud', iso: '2025-04-08' },
  "tech improvments are only goood if they save money": { newSlug: 'values-beyond-the-bottom-line', iso: '2025-04-03' },
  "Where's the bottleneck": { newSlug: 'does-genai-remove-the-bottleneck', iso: '2025-03-01' },
  'bicycle-or-wheelchair': { newSlug: 'bicycle-or-wheelchair', iso: '2024-06-01' },
};

const re =
  /\{\s*slug:\s*"([^"]*)"\s*,\s*title:\s*"([^"]*)"\s*,\s*date:\s*"([^"]*)"\s*,\s*preview:\s*"([^"]*)"\s*,\s*content\s*:\s*`([\s\S]*?)`\s*,?\s*\n\s*\},?/g;

const isCodey = (l) =>
  /[{}]/.test(l) ||
  /<\/?[A-Za-z_]/.test(l) ||
  /^(\s*)(Invoke-AzRestMethod|OLLAMA_HOST|ollama\s|pip\s|open-webui|-Method|-Path|-Payload)\b/.test(l);

function normalizeBody(raw) {
  const lines = raw.split(/\r?\n/);
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const raw0 = lines[i];
    const trimmed = raw0.replace(/^\s+|\s+$/g, '');
    if (trimmed === '') { i++; continue; }
    if (isCodey(raw0)) {
      // gather contiguous code-y run
      const run = [];
      while (i < lines.length) {
        const t = lines[i].replace(/^\s+|\s+$/g, '');
        if (t === '') { i++; continue; }
        if (isCodey(lines[i])) { run.push(t); i++; }
        else break;
      }
      blocks.push('```\n' + run.join('\n') + '\n```');
    } else {
      blocks.push(trimmed);
      i++;
    }
  }
  return blocks.join('\n\n');
}

let count = 0;
let m;
const written = [];
while ((m = re.exec(text)) !== null) {
  const [, oldSlug, title, date, preview, content] = m;
  const map = meta[oldSlug];
  if (!map) throw new Error('No meta mapping for slug: ' + JSON.stringify(oldSlug));
  const fm = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `date: ${JSON.stringify(map.iso)}`,
    'type: essay',
    `excerpt: ${JSON.stringify(preview)}`,
    '---',
    '',
    normalizeBody(content),
    '',
  ].join('\n');
  const outPath = path.join(OUT, map.newSlug + '.mdx');
  fs.writeFileSync(outPath, fm, 'utf8');
  written.push({ oldSlug, newSlug: map.newSlug, title, date, iso: map.iso });
  count++;
}

console.log('Wrote %d files:', count);
for (const w of written) {
  console.log('  %-28s -> %-40s %s', w.oldSlug, w.newSlug, w.iso);
}
if (count !== 15) throw new Error('Expected 15 posts, got ' + count);
console.log('OK');