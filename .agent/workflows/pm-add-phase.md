---
description: Add a new phase to the active milestone
---

# Add Phase Workflow

Add a new phase to an existing milestone to cover additional work discovered during execution.

## When to Use

When you discover work that doesn't fit into existing phases, or when you need to extend the milestone scope.

## Prerequisites

- Active milestone exists (`pm milestone list --status active`)

---

## Step 1: Review Existing Phases

```bash
pm phase list --json
```

Note the current phase numbers to determine where the new phase should sit in the ordering.

---

## Step 2: Add the Phase

```bash
pm phase add "<name>" --number <n> --description "<description>"
```

This does **two things**:
1. **Database** — stores brief metadata (number, name, description, status)
2. **Filesystem** — auto-generates `.pm/milestones/<milestone>/<N>/PHASE.md` from `.pm/templates/phase-summary.md`

**Example:**

```bash
pm phase add "Performance Optimization" --number 5 --description "Profile and optimize critical paths"
```

**Options:**
- `--number <n>` (required) — ordering number; use gaps or append at end
- `--milestone <slug>` — defaults to the active milestone
- `--description <text>` — phase description

---

## Step 3: Verify

```bash
pm phase list --json
```

Confirm the new phase appears with the correct number and `not_started` status.

---

## Step 4: Commit

```bash
git add -A
git commit -m "docs: add phase {N} - <name>"
```

---

## Success Criteria

- [ ] New phase created with correct number and description
- [ ] `pm phase list` shows it in the right position
- [ ] Phase status is `not_started`
- [ ] Change committed

## Git Rules

| When | Command |
|------|---------|
| After phase added | `git add -A && git commit -m "docs: add phase {N} - <name>"` |

## Related Workflows

| Workflow | Relationship |
|----------|-------------|
| Discuss Phase | Clarify scope before planning |
| Plan Phase | Create plans for the new phase |
| Insert Phase | Insert between existing phases |

## Next Steps

→ [Discuss Phase](pm-discuss-phase.md) — clarify scope (if needed)
→ [Plan Phase](pm-plan-phase.md) — create plans for the new phase
