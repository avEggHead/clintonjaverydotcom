// Build-time WCAG 2.1 AA contrast gate.
// Plain TS — pure arithmetic, no DOM-only APIs (runs in Node at build).
// Source: DESIGN.md #Colors — Contrast; ARCHITECTURE-SPINE.md #AD-6.

import type { Plugin } from "vite";
import { contrastPairs, type ContrastPair } from "./contrast-pairs";

/** Parse a #RRGGBB / #RGB hex string into [r, g, b] (0..255). */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num) || full.length !== 6) {
    throw new Error(`Contrast gate: invalid hex color "${hex}"`);
  }
  return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff];
}

/** WCAG 2.1 relative luminance for a single channel (0..1 normalized). */
function channelLinear(c: number): number {
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.1 relative luminance for an [r,g,b] 0..255 triple. */
function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rn, gn, bn] = [r, g, b].map((v) => v / 255);
  return (
    0.2126 * channelLinear(rn) +
    0.7152 * channelLinear(gn) +
    0.0722 * channelLinear(bn)
  );
}

/** WCAG 2.1 contrast ratio between two relative luminances. */
function contrastRatio(light: number, dark: number): number {
  return (light + 0.05) / (dark + 0.05);
}

/** Pretty-print a ratio to 2 decimals. */
function ratioStr(ratio: number): string {
  return ratio.toFixed(2);
}

/** Runs the gate. Throws if any pair is under its `min`. */
function runGate(pairs: ContrastPair[] = contrastPairs): void {
  const failures: string[] = [];
  for (const pair of pairs) {
    const fgLum = relativeLuminance(hexToRgb(pair.fg));
    const bgLum = relativeLuminance(hexToRgb(pair.bg));
    const light = Math.max(fgLum, bgLum);
    const dark = Math.min(fgLum, bgLum);
    const ratio = contrastRatio(light, dark);
    if (ratio < pair.min) {
      const lock = pair.lockedIfUnder
        ? ` — lock ${pair.lockedIfUnder}`
        : " — no locked variant declared";
      failures.push(
        `Contrast gate: ${pair.label} (${pair.fg} on ${pair.bg}) = ${ratioStr(
          ratio,
        )}:1 (need ${pair.min}:1)${lock}`,
      );
    }
  }
  if (failures.length > 0) {
    throw new Error(
      `\n  ✖ ${failures.length} contrast gate failure(s):\n` +
        failures.map((f) => `    ${f}`).join("\n") +
        "\n  See DESIGN.md #Colors and src/build/contrast-pairs.ts.",
    );
  }
}

/** The Ink & Garden contrast-gate Vite plugin. Fails closed in build; warns in dev. */
export function inkGardenContrastGate(): Plugin {
  return {
    name: "ink-garden-contrast-gate",
    buildStart() {
      // Throwing here fails `vite build` closed (AD-6 / AC4).
      runGate();
    },
    configureServer(server) {
      try {
        runGate();
      } catch (err) {
        server.config.logger.warn(
          `  \u26a0 ${String((err as Error).message)}\n`,
        );
      }
    },
  };
}