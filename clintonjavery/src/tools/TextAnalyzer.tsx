// Text Analyzer — re-skinned to Tailwind v4 + @theme tokens (Epic 4 / Story
// 4.2). Behavior preserved from the v1 tool: live word/character/character-no-
// spaces/whitespace/line/punctuation counts as you type. No CSS module, no own
// <h1> (the Project show page carries the title, one h1/page NFR-1). AD-6.
import { useState } from 'react';
import { field } from '../site/buttons';

export default function TextAnalyzer() {
  const [text, setText] = useState('');

  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;
  const whiteSpaceCount = charCount - charCountNoSpaces;
  const lineCount = text.split(/\n/).length;
  const punctuationCount = (text.match(/[.,/#!$%^&*;:{}=\-_`~()"'?]/g) || []).length;

  const stats = [
    ['Words', wordCount],
    ['Characters (incl. spaces)', charCount],
    ['Characters (excl. spaces)', charCountNoSpaces],
    ['Whitespace', whiteSpaceCount],
    ['Lines', lineCount],
    ['Punctuation', punctuationCount],
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder="Type or paste your text here…"
        aria-label="Text to analyze"
        className={`${field} min-h-[200px] resize-y leading-relaxed`}
      />

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
            <dt className="font-body text-body-sm text-on-surface-variant">{label}</dt>
            <dd className="mt-1 font-display text-headline-sm text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}