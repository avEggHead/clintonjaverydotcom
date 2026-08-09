import { useState } from 'react';
import * as Slider from '@radix-ui/react-slider';

// Effort Estimator — re-skinned to Tailwind v4 + @theme tokens (Epic 4 /
// Story 4.2). The estimation MATH is preserved verbatim from the v1 tool
// (normalize → sqrt dampening → ceil → nearest Fibonacci); only the visuals
// were re-skinned (the v1 had a 500px-wide thumb, magenta debug borders,
// and a white-on-dark "space" spacer — all cruft). No CSS module, no own <h1>
// (the Project show page carries the title, one h1/page NFR-1). AD-6.

const dimensions = [
  'Complexity',
  'NewCode',
  'Testing',
  'Coordination',
  'Research',
] as const;

type Dimension = (typeof dimensions)[number];
type EffortValues = Record<Dimension, number>;

// Fibonacci helper (preserved from v1).
function getNearestFibonacci(n: number): number {
  const fib = [0, 1];
  while (fib[fib.length - 1] < n) {
    fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
  }
  return fib.find((f) => f >= n) || n;
}

export default function EffortSlider() {
  const initialState: EffortValues = dimensions.reduce((acc, dim) => {
    acc[dim] = 0;
    return acc;
  }, {} as EffortValues);

  const [values, setValues] = useState<EffortValues>(initialState);
  const MAX_SLIDER = 5;

  // 1. Normalize all sliders to 0–1 (preserved).
  const normalizedEffort = Object.values(values).reduce((sum, val) => {
    const normalized = val / MAX_SLIDER;
    return sum + normalized;
  }, 0);

  // 2. Apply non-linear scaling (square root slows things down nicely) — preserved.
  const dampenedEffort = Math.sqrt(normalizedEffort) * 4.5;

  // 3. Round up to nearest Fibonacci — preserved.
  const fibEffort = getNearestFibonacci(Math.ceil(dampenedEffort));

  const handleChange = (dim: Dimension, val: number) => {
    setValues((prev) => ({ ...prev, [dim]: val }));
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* The estimate is the tool's output — a result display, not a heading
          (the page h1 is the project title; one h1/page, NFR-1). */}
      <p className="font-display text-headline-lg text-ink">
        Effort estimate: <span className="text-primary">{fibEffort}</span>
      </p>

      <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
        {dimensions.map((dim) => (
          <div key={dim} className="flex w-14 flex-col items-center gap-3">
            <Slider.Root
              orientation="vertical"
              min={0}
              max={8}
              step={0.05}
              value={[values[dim]]}
              onValueChange={([val]) => handleChange(dim, val)}
              aria-label={dim}
              className="relative flex h-[160px] w-10 flex-col-reverse items-center justify-center"
            >
              <Slider.Track className="relative h-full w-3 grow overflow-hidden rounded-full bg-surface-container">
                <Slider.Range className="absolute bottom-0 w-full rounded-full bg-primary" />
              </Slider.Track>
              <Slider.Thumb className="block h-5 w-6 rounded-md border border-outline bg-primary-strong shadow-sm transition-colors hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" />
            </Slider.Root>
            <label className="text-center font-body text-body-sm font-semibold text-ink">
              {dim}
            </label>
          </div>
        ))}
      </div>

      <p className="max-w-prose text-center font-body text-body-sm text-on-surface-variant">
        Drag each dimension 0–8. The estimate normalizes, dampens with a square
        root, then rounds up to the nearest Fibonacci point.
      </p>
    </div>
  );
}