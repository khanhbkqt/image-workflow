---
description: Remove a phase from the milestone with safety checks
---

# Remove Phase Workflow

Remove a phase from a milestone, with safety checks for in-progress or completed work.

## When to Use

When a phase is no longer needed — scope changed, requirements dropped, or phase was created in error.

## Prerequisites

- Active milestone with phases (`pm phase list --milestone <milestone-id> --json`)

---

## Step 1: Identify the Phase

```bash
pm phase list --milestone <milestone-id> --json
pm phase show <phase-id> --json
```

---

## Step 2: Safety Checks

Check phase status before removing:

```bash
pm plan list --phase <phase-id> --json
```

| Phase Status | Action |
|-------------|--------|
| `not_started` | Safe to remove |
| `in_progress` | Warn — has active plans. Confirm with user |
| `completed` | **Cannot remove** — archive instead |

If plans are `in_progress` or `completed`, warn the user and ask for confirmation before proceeding.

---

## Step 3: Check for Dependencies

Review if other phases depend on this one:

```bash
pm phase list --milestone <milestone-id> --json
```

Inspect phase descriptions for dependency references. If dependencies exist, update dependent phases first.

---

## Step 4: Remove Plans First

Delete all plans in the phase:

```bash
# For each plan in the phase
pm plan update <plan-id> --status failed
```

---

## Step 5: Renumber Subsequent Phases

For each phase after the removed one, decrement its number:

```bash
pm phase update <phase-id> --number <new-number>
```

> **Note:** Update from lowest to highest to avoid collisions.

---

## Step 6: Verify

```bash
pm phase list --milestone <milestone-id> --json
pm progress
```

## Success Criteria

- [ ] Phase removed from milestone
- [ ] Subsequent phases renumbered correctly
- [ ] No orphaned dependencies
- [ ] `pm progress` reflects updated structure

## Offer Next Steps

Present the result and confirm the updated structure:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM CLI ► PHASE REMOVED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase removed. Remaining phases renumbered.

───────────────────────────────────────────────────────

▶ NEXT

/pm-progress   — Verify the updated milestone structure
/pm-plan-phase — Plan remaining phases
───────────────────────────────────────────────────────
```
