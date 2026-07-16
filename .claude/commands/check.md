---
description: Run the correctness gate (typecheck + lint + diff review) via the code-checker agent
---

Use the **code-checker** subagent to gate the current change: run `npm run typecheck` and `npm run lint`, then review the working diff for correctness/logic bugs.

Scope: $ARGUMENTS (default: the current uncommitted diff).

Relay the agent's verdict and findings. This is the correctness gate — design-system drift belongs to `/audit-ui`, and a deeper multi-file pass belongs to `/code-review`.
