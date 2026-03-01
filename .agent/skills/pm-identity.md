---
description: PM Identity - How to register and authenticate as an agent
---

# PM Identity Setup

Every `pm` action is attributed to an agent. You must set identity before creating or modifying data.

## Register

```bash
pm agent register <name> --role <role> --type ai --json
```

| Flag     | Required | Values                                      |
| -------- | -------- | ------------------------------------------- |
| `--role` | Yes      | `developer`, `reviewer`, `pm`, `researcher` |
| `--type` | Yes      | `ai` or `human` (always use `ai`)           |

## Set Identity

Two methods (in priority order):

| Method                | Scope        | Example                             |
| --------------------- | ------------ | ----------------------------------- |
| `--agent <name>` flag | Per-command  | `pm plan list --phase 1 --agent atlas --json` |
| `PM_AGENT` env var    | Session-wide | `export PM_AGENT=atlas`             |

**Recommended:** Set `PM_AGENT` at session start. The `--agent` flag overrides the env var if both are set.

## Verify

```bash
pm agent whoami --json
```

**Always run this before starting work to confirm identity is active.**
