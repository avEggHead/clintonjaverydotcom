// Unit Converter — re-skinned to Tailwind v4 + @theme tokens (Epic 4 / Story
// 4.2). The conversion LOGIC is preserved verbatim from the v1 tool: a flat
// 6-unit table (m/ft/kg/lb/l/gal) with `result = value * conv[from] / conv[to]`.
// NOTE: the v1 table mixes length/mass/volume into one table (so `m → kg`
// produces a cross-category value); that quirk is preserved as-is per the
// "no behavior regression" AC — flagged for a future fix, not silently changed.
// No CSS module, no own <h1>. AD-6.
import { useState } from 'react';
import { field } from '../site/buttons';

type Unit = 'm' | 'ft' | 'kg' | 'lb' | 'l' | 'gal';

const conversions: Record<Unit, number> = {
  m: 1,
  ft: 0.3048,
  kg: 1,
  lb: 0.453592,
  l: 1,
  gal: 3.78541,
};

const units = Object.keys(conversions) as Unit[];

export default function UnitConverter() {
  const [value, setValue] = useState(0);
  const [from, setFrom] = useState<Unit>('m');
  const [to, setTo] = useState<Unit>('ft');
  const result = (value * conversions[from]) / conversions[to];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="uc-value" className="font-body text-body-sm font-semibold text-ink">
          Value
        </label>
        <input
          id="uc-value"
          type="number"
          value={value}
          onChange={(e) => setValue(parseFloat(e.target.value))}
          className={field}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="uc-from" className="font-body text-body-sm font-semibold text-ink">
          From
        </label>
        <select
          id="uc-from"
          value={from}
          onChange={(e) => setFrom(e.target.value as Unit)}
          className={field}
        >
          {units.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      <span aria-hidden className="pb-2.5 text-center font-display text-lg text-ink sm:self-end">
        =
      </span>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="uc-to" className="font-body text-body-sm font-semibold text-ink">
          To
        </label>
        <select
          id="uc-to"
          value={to}
          onChange={(e) => setTo(e.target.value as Unit)}
          className={field}
        >
          {units.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-h-[44px] items-center rounded-md border border-outline-variant bg-surface-container-low px-4 py-2 sm:self-end">
        <span className="font-display text-headline-sm text-ink">{result.toFixed(4)}</span>
      </div>
    </div>
  );
}