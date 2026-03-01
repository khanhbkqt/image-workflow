---
description: Complete and optionally archive a milestone
---

# Complete Milestone Workflow

Finalize a milestone after all phases are done, and optionally archive it.

## When to Use

When all phases in a milestone are `completed` or `skipped`, and you're ready to mark the milestone as done.

## Prerequisites

- All phases are `completed` or `skipped` (check with `pm progress`)
- Work has been verified (see [Verify Work](pm-verify-work.md))

---

## Step 1: Check All Phases Are Done

```bash
pm progress
```

Verify every phase shows as `completed` or `skipped`. If any phases are incomplete, finish them first or skip them explicitly:

```bash
pm phase update <phase-id> --status skipped
```

---

## Step 2: Complete the Milestone

```bash
pm milestone update <slug> --status completed
```

**Cascading behavior:** Completion requires all phases to be `completed` or `skipped`. If any phase is in another status, this command will fail.

**Force completion** (skip the phase check):

```bash
pm milestone update <slug> --status completed --force
```

Use `--force` sparingly — only when you intentionally want to close a milestone with unfinished phases.

---

## Step 3: Archive (Optional)

After completion, optionally archive the milestone to remove it from active views:

```bash
pm milestone update <slug> --status archived
```

Archived milestones are still queryable but won't appear in default listings.

---

## Step 4: Verify Completion

```bash
pm milestone show <slug> --json
```

Confirm status is `completed` or `archived`.

---

## Step 5: Commit Milestone Completion

```bash
git add -A
git commit -m "docs: complete milestone <slug>"
```

---

## Milestone Status Transitions

```
planned → active → completed → archived
```

## Cascading Behavior

- Completion requires all phases `completed` or `skipped` (unless `--force`)
- `--force` bypasses the phase completion check

## Success Criteria

- [ ] All phases are `completed` or `skipped`
- [ ] Milestone status is `completed`
- [ ] `pm milestone show` confirms final state
- [ ] Change committed

## Git Rules

| When | Command |
|------|---------|
| After milestone completed | `git add -A && git commit -m "docs: complete milestone <slug>"` |

## Related Workflows

| Workflow | Relationship |
|----------|-------------|
| Audit Milestone | Pre-completion quality check |
| New Milestone | Start the next body of work |
| Verify Work | Ensure phases were properly verified |

## Next Steps

→ [New Milestone](pm-new-milestone.md) — start the next body of work
