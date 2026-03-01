---
description: Context hygiene — dump state for clean session handoff
---

# Pause Work Workflow

Safely pause work with complete state preservation for session handoff.

## When to Use

- Ending a work session
- Context getting heavy (many failed attempts)
- Switching to a different task
- After 3+ debugging failures (Context Hygiene rule)

---

## Step 1: Capture Current State

Record your position and all critical context:

```bash
pm context set session:phase "<phase number and name>"
pm context set session:plan "<plan ID or description>"
pm context set session:status "Paused at <timestamp>"
```

---

## Step 2: Save Context Dump

Save everything that would be lost without this capture:

```bash
pm context set session:summary "<what was accomplished this session>"
pm context set session:in-progress "<uncommitted changes, partial work>"
pm context set session:blockers "<what was preventing progress>"
```

### Decisions and Approaches

```bash
pm context set session:decisions "<decision 1: rationale, decision 2: rationale>"
pm context set session:approaches-tried "<approach 1: outcome, approach 2: outcome>"
pm context set session:hypothesis "<best guess at solution/issue>"
pm context set session:files-of-interest "<file1: what's relevant, file2: what's relevant>"
```

### Next Steps

```bash
pm context set session:next-steps "<1. specific first action, 2. second priority, 3. third priority>"
```

---

## Step 3: Clean Up In-Progress Plans

If you have plans in `in_progress` that won't be resumed soon:

- **Resuming soon** — Leave as `in_progress`
- **Not resuming** — Reset to `pending`

```bash
pm plan update <plan-id> --status pending
```

---

## Step 4: Commit State

```bash
git add -A
git commit -m "docs: pause session - <brief reason>"
```

---

## Context Hygiene (Debugging Failures)

If pausing due to repeated debugging failures:

1. Be explicit about what failed
2. Document exact error messages
3. List files that were touched
4. State your hypothesis clearly
5. Suggest a different approach for next session

A fresh context often sees solutions that a polluted context missed.

---

## Proactive Auto-Save

**Problem:** If a session terminates unexpectedly, `/pause` becomes unreachable.

**Solution:** Auto-save state BEFORE limits are hit.

| Trigger | Action |
|---------|--------|
| Context usage ~50-70% | Save lightweight state via `pm context set` |
| 3-strike debugging rule fires | Save state dump BEFORE recommending pause |
| Extended session detected | Periodic state checkpoints |

**Key principle:** Save first, recommend second. Never rely on being able to issue `/pause`.

---

## Git Rules

| When | Command |
|------|---------|
| After state saved | `git add -A && git commit -m "docs: pause session - <reason>"` |

## Related Workflows

| Workflow | Relationship |
|----------|-------------|
| Resume | Restore context from this pause |
| Debug | Use before pause when debugging fails |
| Progress | Check milestone state before pausing |

## Next Steps

→ [Resume Work](pm-resume.md) — pick up where you left off
