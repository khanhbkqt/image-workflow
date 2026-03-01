---
description: Show current position in roadmap and next steps
---

# Check Progress Workflow

Quick status check — where are we and what's next?

## When to Use

At any point during project work when you need to understand overall progress, identify blockers, or decide what to work on next.

## Prerequisites

- At least one milestone exists

---

## Step 1: Check Overall Progress

```bash
pm progress
```

For a specific milestone:

```bash
pm progress --milestone <milestone-id>
```

---

## Step 2: Review Phase Details

```bash
pm phase list --json
```

For a specific phase:

```bash
pm phase show <phase-id>
```

---

## Step 3: Drill Into Plans

```bash
pm plan list --phase <phase-id> --json
```

Or use the kanban board view:

```bash
pm plan board --phase <phase-id>
```

---

## Step 4: Suggest Next Action

Based on state, recommend the next action:

| State | Recommendation |
|-------|----------------|
| Phase in progress | Execute Phase — continue working |
| Phase done, not verified | Verify Work |
| Verification failed | Execute Phase (gap closure) |
| All phases complete | Audit Milestone or Complete Milestone |
| No phases started | Plan Phase to begin |
| SPEC not finalized | Complete SPEC.md first |

---

## Related Workflows

| Workflow | Relationship |
|----------|-------------|
| Execute Phase | Continue working on plans |
| Verify Work | Validate completed phase |
| Audit Milestone | Review milestone quality |
| Complete Milestone | Archive completed milestone |
