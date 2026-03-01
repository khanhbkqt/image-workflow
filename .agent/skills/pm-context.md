---
description: PM Context - How to share decisions, specs, and constraints
---

# PM Context Sharing

Context is a persistent key-value store for sharing decisions, specs, notes, and constraints across agents.

## Setting Context

**Requires identity.** *The agent must be registered in the system before calling this command.*

```bash
pm context set <key> <value> [--category <cat>]
```

| Category     | Purpose                         |
| ------------ | ------------------------------- |
| `decision`   | Architectural/design choices    |
| `spec`       | Requirements and specifications |
| `note`       | General information (default)   |
| `constraint` | Limitations and rules           |

**CRITICAL:** The `--category` flag only accepts the 4 exact strings above. Using any other category (like `summary` or `reference`) will result in a database CHECK constraint error.

> Setting an existing key overwrites it. Check before writing.

**Key naming:** Use kebab-case (`api-base-url`, `db-engine`, `auth-method`).

**Complex values:** Serialize as JSON strings:

```bash
pm context set "db-config" '{"engine":"sqlite","mode":"wal"}' --category decision --json
```

## Reading Context

- **Read specific:** `pm context get "<key>" --json`
- **Browse category:** `pm context list --category decision --json` — see all decisions
- **Search:** `pm context search "<topic>" --json`

## Real World Usage

1. **Check first:** `pm context search "<topic>" --json` — avoid overwriting existing decisions
2. **Set:** `pm context set "<key>" "<value>" --category decision --json`
3. **Read:** `pm context get "<key>" --json`
