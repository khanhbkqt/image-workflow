---
description: Restore context from previous session
---

# Resume Work Workflow

Start a new session with full context from where you left off.

## When to Use

When starting a new session after a previous pause, or when you need to understand the current project state.

## Prerequisites

- Project is initialized
- Previous session context was saved (optional but helpful)

---

## Step 1: Load Saved State

```bash
pm context get session:phase
pm context get session:plan
pm context get session:status
pm context get session:summary
pm context get session:next-steps
```

If no saved context exists, skip to Step 2.

---

## Step 2: Check for Uncommitted Changes

```bash
git status --porcelain
```

**If changes found:**
```
⚠️ UNCOMMITTED CHANGES DETECTED
{list of modified files}
These may be from the previous session. Review before proceeding.
```

---

## Step 3: Review Overall Progress

```bash
pm progress
```

Understand where the project stands — which phases are done, in progress, or pending.

---

## Step 4: Load Previous Context

If debugging context was saved:

```bash
pm context get session:blockers
pm context get session:approaches-tried
pm context get session:hypothesis
pm context get session:files-of-interest
```

Review what was tried and what failed — avoid repeating failed approaches.

---

## Step 5: Find Pending Work

```bash
pm plan list --phase <phase-id> --json
```

Look for:
1. Plans in `in_progress` — resume these first
2. Plans in `pending` — start the next one
3. Plans in `failed` — consider retrying with fresh perspective

---

## Step 6: Suggest Action

Based on state, recommend the next action:

| State | Recommendation |
|-------|----------------|
| Phase in progress | Execute Phase to continue |
| Phase done, not verified | Verify Work |
| Verification failed | Execute Phase (gaps only) |
| All phases complete | Complete Milestone or celebrate 🎉 |
| No phases started | Plan Phase to begin |

---

## Fresh Context Advantage

A resumed session has advantages:
1. **No accumulated confusion** — see the problem clearly
2. **Documented failures** — know what NOT to try
3. **Hypothesis preserved** — pick up where logic left off
4. **Full context budget** — fresh capacity for new approaches

Often the first thing a fresh context sees is the obvious solution that a tired context missed.

---

## Related Workflows

| Workflow | Relationship |
|----------|-------------|
| Pause | Creates the state restored here |
| Execute Phase | Continue phase execution |
| Verify Work | Validate completed phase |
| Progress | Check overall milestone state |

## Offer Next Steps

Present the restored context and suggest continuing:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM CLI ► SESSION RESUMED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Context restored from .pm/STATE.md
Current position: {phase N — plan X}

───────────────────────────────────────────────────────

▶ NEXT

/pm-execute-phase — Continue executing plans
/pm-progress     — Check overall milestone state if you need more context
───────────────────────────────────────────────────────
```

