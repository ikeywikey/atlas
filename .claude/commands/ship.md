---
description: Branch, commit, and open a PR via the github-handler agent
---

Use the **github-handler** subagent to ship the current work: branch off `main` if needed, stage deliberately, commit with the repo's conventions, and prepare the push / PR.

Context: $ARGUMENTS

The agent must **pause for explicit confirmation before pushing or opening a PR** (outward-facing actions). Relay the branch, commit(s), and what needs approval.
