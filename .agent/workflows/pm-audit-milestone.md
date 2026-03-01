---
description: Audit a milestone before completion
---

# Audit Milestone Workflow

Pre-completion audit to verify all phases are done and no work was missed before marking the milestone complete.

## When to Use

When you believe a milestone is ready to complete, but want to do a thorough check first. This is the step between executing work and formally completing the milestone.

## Prerequisites

- Milestone is active (`pm milestone list --status active`)
- Most phases should be in `completed` status

---

## Step 1: Check Overall Progress

```bash
pm progress
```

Review the completion percentage and identify any phases not yet at 100%.

---

## Step 2: Review Each Phase

```bash
pm phase list --json
```

For each phase, check its status:

- `completed` — ✓ Done
- `skipped` — ✓ Intentionally excluded
- `in_progress` — ⚠ Still has work to do
- `not_started` — ⚠ Was this forgotten?
- `planning` — ⚠ Was planning never finished?

---

## Step 3: Handle Incomplete Phases

For each incomplete phase, decide:

**Option A: Complete it** — Go back and finish the work:

→ [Execute Phase](pm-execute-phase.md)

**Option B: Skip it** — It's out of scope or deferred:

```bash
pm phase update <phase-id> --status skipped
```

**Option C: Force complete** — Use `--force` on milestone completion (not recommended):

```bash
pm milestone update <slug> --status completed --force
```

---

## Step 4: Verify All Deliverables

For each completed phase, spot-check that deliverables actually exist:

- Code is committed
- Tests pass
- Documentation is written
- No placeholder or TODO items remain

---

## Step 5: Proceed to Completion

Once all phases are `completed` or `skipped`:

→ [Complete Milestone](pm-complete-milestone.md)

---

## Step 6: Commit Audit Findings

If decisions were made (phases skipped, issues found):

```bash
git add -A
git commit -m "docs: milestone audit - <slug>"
```

---

## Success Criteria

- [ ] Every phase is accounted for (`completed` or `skipped`)
- [ ] No phases are accidentally left as `not_started` or `in_progress`
- [ ] Key deliverables verified with empirical evidence
- [ ] Ready for formal milestone completion

## Git Rules

| When | Command |
|------|---------|
| After audit complete | `git add -A && git commit -m "docs: milestone audit - <slug>"` |

## Related Workflows

| Workflow | Relationship |
|----------|-------------|
| Complete Milestone | Finalize after audit passes |
| Execute Phase | Finish incomplete phases |
| Verify Work | Verify individual phases |
| Plan Milestone Gaps | Create plans for found gaps |

## Next Steps

→ [Complete Milestone](pm-complete-milestone.md) — finalize the milestone
→ [Plan Milestone Gaps](pm-plan-milestone-gaps.md) — address found gaps
