# Design references

Screenshots of the **intended design** for Atlas's UI. Drop images here and they
become the visual source of truth for building and reviewing screens.

## How this is used

- **Build stage** — before building or reworking a screen this folder covers,
  look at the matching reference and match it (layout, spacing, hierarchy,
  color) while expressing it through Atlas's tokens + primitives. The
  `ui-ux-pro-max` skill informs direction; these images are the concrete target.
- Colors/spacing pulled from a reference should still map to theme tokens in
  `src/index.css` (add a token if one doesn't exist yet) — never hardcode raw
  values just to match a screenshot.

## Naming

Name files for what they show so they're easy to reference in a request, e.g.:

- `dashboard-full.png` — the whole dashboard
- `accounts-card.png` — the Accounts card
- `net-worth-graph.png` — the net-worth screen
- `<screen>-<state>.png` — a specific state (empty, loading, hover)

Paste screenshots into this folder (`docs/design/`) and mention the filename when
you want it referenced.
