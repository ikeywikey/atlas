---
description: Audit UI components for design-system drift via the ui-consistency-checker agent
---

Use the **ui-consistency-checker** subagent to audit the target components against Atlas's design system (Card primitive, theme tokens, shadcn authoring conventions).

Target: $ARGUMENTS

If no target is given, audit the components changed in the current working tree (`git status --short`), falling back to `src/components/**/*.tsx` + `src/pages/**/*.tsx`. Relay the agent's findings report.
