// Ink & Garden — load-bearing WCAG 2.1 AA contrast pairs.
// Data, not component code — hex literals are allowed here (this is the
// single declared source the contrast gate reads at build time).
// Source: DESIGN.md #Colors — Contrast (WCAG 2.1 AA load-bearing pairs).

export interface ContrastPair {
  /** Foreground color, hex e.g. "#1A1F1B" */
  fg: string;
  /** Background color, hex e.g. "#FBFAF6" */
  bg: string;
  /** Minimum contrast ratio required (4.5 for normal text). */
  min: number;
  /** Darker variant to lock if this pair measures under `min`. */
  lockedIfUnder?: string;
  /** Human label for the pair, used in error messages. */
  label: string;
}

export const contrastPairs: ContrastPair[] = [
  {
    label: "Ink on Surface",
    fg: "#1A1F1B",
    bg: "#FBFAF6",
    min: 4.5,
  },
  {
    label: "On-Surface-Variant on Surface",
    fg: "#4A5249",
    bg: "#FBFAF6",
    min: 4.5,
  },
  {
    label: "Link on Surface",
    fg: "#256628",
    bg: "#FBFAF6",
    min: 4.5,
    lockedIfUnder: "#256628",
  },
  {
    label: "White on Primary-Strong",
    fg: "#FFFFFF",
    bg: "#26702C",
    min: 4.5,
    lockedIfUnder: "#26702C",
  },
];