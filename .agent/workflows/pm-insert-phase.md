---
description: Insert a phase between existing phases (renumbers subsequent)
---

# Insert Phase Workflow

Insert a new phase at a specific position within a milestone, renumbering all subsequent phases.

## When to Use

When a new phase needs to be added between existing phases rather than appended at the end.

## Prerequisites

- Active milestone exists (`pm milestone list --json`)
- Know the position where the new phase should be inserted

---

## Step 1: Review Current Phases

```bash
pm phase list --milestone <milestone-id> --json
```

Identify the position where the new phase should be inserted.

---

## Step 2: Gather Phase Information

Determine:
- **Name** — Phase title
- **Position** — Where to insert (e.g., 2 inserts before current Phase 2)
- **Objective** — What this phase achieves
- **Dependencies** — What it needs from earlier phases

---

## Step 3: Create the New Phase

```bash
pm phase create "<name>" --milestone <milestone-id> --number <position>
```

---

## Step 4: Renumber Subsequent Phases

For each phase with number >= position (excluding the new one), update its number:

```bash
pm phase update <phase-id> --number <new-number>
```

> **Note:** Update from highest to lowest to avoid number collisions.

---

## Step 5: Verify

```bash
pm phase list --milestone <milestone-id> --json
pm progress
```

Confirm phases are correctly numbered and ordered.

---

## Warning

Phase insertion can be disruptive. Consider:
- In-progress phases may have commits referencing old numbers
- Existing plans reference phase numbers
- Use sparingly and early in milestone lifecycle

## Success Criteria

- [ ] Phase inserted at correct position
- [ ] Subsequent phases renumbered correctly
- [ ] `pm progress` reflects updated structure

## Offer Next Steps

Present the result and suggest what to do next:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM CLI ► PHASE INSERTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase {N}: {name} inserted. Subsequent phases renumbered.

───────────────────────────────────────────────────────

▶ NEXT

/pm-plan-phase — Create plans for the new phase
/pm-progress   — See the updated roadmap
───────────────────────────────────────────────────────
```
