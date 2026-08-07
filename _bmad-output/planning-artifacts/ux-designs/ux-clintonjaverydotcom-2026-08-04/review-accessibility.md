# Accessibility Review — clintonjaverydotcom

**Reviewer:** accessibility lens (WCAG 2.1 AA — PRD-confirmed target).
**Scope:** against the post-fix spines + `mockups/key-comic-post-viewer.html` (the load-bearing a11y surface: the comic zoom interaction, FR-16) + `mockups/key-landing-hero.html`.
**Run at:** 2026-08-04

## Preamble

The spine pair declares an AA floor (EXPERIENCE.md §Accessibility Floor) and the comic-zoom keyboard set is pinned. This lens checks whether the declared floor is *complete and consistently applied* — focusing on the parts an automated contrast checker or a keyboard user would actually exercise.

## Findings

- **medium** Primary Green `#2E7D32` as in-prose link text on Surface and white-on-Primary button fill sit at the 4.5:1 AA normal-text threshold (location: DESIGN.md §Colors — Contrast). The spine names darker alternates (`#256628` / `#26702C`) and flags them as "verify before ship," but the final darkened value is unselected. *Fix:* make contrast verification an explicit story task (architecture → story-dev); run a contrast tool on Primary-as-link and white-on-Primary, lock to the darker variant if under 4.5:1. Ship gate: no Primary-on-Surface or white-on-Primary pairing passes without meeting AA.

- **medium → closed** Secondary `#C2602F` as paragraph text fails AA at 17px (location: DESIGN.md §Colors; previously the comic-caption was a Secondary fill). **Closed in this pass:** the spine and mock now render the comic caption in `{colors.on-surface-variant}` with a Secondary *left accent rule* only (not a fill). No further action; left recorded so a future redesigner doesn't regress it.

- **low** Zoom controls focus operability (location: EXPERIENCE.md §Comic Presentation; mock `key-comic-post-viewer.html`). The spine states the viewer is keyboard-operable and does not trap focus, and the on-screen `+`/`−`/`Reset` controls auto-hide after inactivity. Confirm in implementation that auto-hidden controls remain *keyboard-reachable* (focusable) even when visually hidden, or reveal on focus. *Fix:* the implementation story must keep controls focusable while auto-hidden (or reveal-on-focus), matching "focus-visible on every interactive element."

- **low** `prefers-reduced-motion` transition budget (location: EXPERIENCE.md §State Patterns; §Comic Presentation). The spine allows a ≤150ms zoom transition under reduced motion. WCAG 2.3.3 (Animation from Interactions, AAA) and 2.2.2 guidance favor *no* non-essential motion under reduced-motion; the 150ms budget is lenient. *Fix:* recommend reducing to "instant under reduced-motion" (drop the 150ms allowance) in the implementation; the spine's "instant" wording already covers this for scroll-reveal.

- **low** Skip-to-content + mobile-nav keyboard behavior (location: EXPERIENCE.md §Accessibility Floor). The skip link is specified first-focusable; the mobile nav (≤640) collapses to a menu button but the spine doesn't state the menu closes on `Escape` / on route change / on outside click. *Fix:* add a one-line note that the collapsed nav menu closes on `Escape` and on navigation.

- **low** Comic Alt Text quality gate is build-time (FR-8) — good — but the spine should note that alt text must *describe the gag/content*, not the image ("a comic"), to satisfy the AA/AAA informative-image intent. This is already stated in EXPERIENCE.md §Accessibility Floor; no action — left recorded.

## Summary
The declared AA floor is coherent and the comic-zoom set is keyboard-complete. The one open gate is contrast measurement: finalize the darkened-green variants before ship (an implementation story owns it). One caption-color regression risk is now closed in-spine. Remaining items are low-severity implementation clarifications.