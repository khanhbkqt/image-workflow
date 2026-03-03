---
description: Execute plans in a phase using wave-based ordering
---

# Execute Phase Workflow

Work through a phase's plans in wave order, committing after each plan and verifying at the end.

## When to Use

After plans have been created for a phase (via the Plan Phase workflow) and you're ready to start implementation.

## Prerequisites

- Phase has plans — confirm by resolving `<phase-id>` first (see Step 0), then: `pm plan list --phase <phase-id> --json`
- Plans are in `pending` status

> ⚠️ `<phase-id>` is the database integer ID, **not** the phase number the user refers to (e.g. "Phase 2"). Always resolve via `pm phase list --json`.

## Rules

- Never execute a plan without reading the full plan from the filesystem
- Never execute a plan without verifying the plan
- Delegate the plan to a sub-agent to implement what the plan describes, keep the context small and focused

---

## Step 0: Quick Trace (Context Recovery)

Before executing any plans, quickly understand the current state:

1. **Read `.pm/ROADMAP.md`**
   - Identify the active milestone and its must-haves
   - Identify the current phase **number** and its objective
2. **Read `.pm/STATE.md`**
   - Check where the last session left off

3. **Resolve the phase-id from the phase number**

   > ⚠️ **CRITICAL:** The user refers to phases by their **number** (e.g. "Phase 3"). This is NOT the database `<phase-id>`. You MUST look up the actual integer ID before running any `pm` command.

   ```bash
   pm phase list --json
   ```

   Find the entry where `"number": <N>` matches the phase the user requested. Use its `"id"` field as `<phase-id>` in all subsequent commands.

   **Example:** If the user says "execute Phase 3", find `"number": 3` in the output and read its `"id"` (e.g. `42`). All further commands use `--phase 42`, not `--phase 3`.

_This ensures you don't execute plans blindly without understanding the wider phase goal._

---

## Step 0.5: Check Blocking Bugs

Before executing plans, check for unresolved blocking bugs:

```bash
pm bug list --blocking --status open
```

**If blocking bugs exist:**
1. Display the blocking bugs to the user
2. Recommend fixing them first → [Fix Bug](pm-fix-bug.md)
3. Do NOT proceed with plan execution until blocking bugs are resolved

**If no blocking bugs:** Proceed to Step 1.

---

## Step 1: Review Plans and Wave Order

```bash
pm plan list --phase <phase-id> --json
```

Group plans by wave. Execute wave 1 first, then wave 2, etc.

Display wave structure before starting:
```
Wave 1: Plan 1.1, Plan 1.2
Wave 2: Plan 1.3
Total: 3 plans across 2 waves
```

---

## Step 2: Execute Each Plan

For each plan in wave order:

### 2a. Start the Plan

```bash
pm plan update <plan-id> --status in_progress
```

**Cascading:** Starting a plan auto-transitions the parent phase to `in_progress` if it's `not_started`.

### 2b. Do the Work

Read the full plan from the filesystem (the DB only stores a brief):

```bash
cat .pm/milestones/<milestone-id>/<phase-number>/<plan-number>-PLAN.md
```

Delegate the plan to a developer agent to implement what the plan describes. Follow task blocks in order:
1. Load plan context
2. Execute tasks
3. Verify each task with empirical evidence (never "it should work")

### 2c. Commit the Work

**After each plan, commit immediately:**

```bash
git add -A
git commit -m "feat(phase-{N}): {plan-name}"
```

### 2d. Complete the Plan

```bash
pm plan update <plan-id> --status completed
```

### 2e. Handle Failures

If a plan cannot be completed:

```bash
pm plan update <plan-id> --status failed
```

To retry: set back to `pending`, then restart from 2a.

---

## Step 3: Verify Wave, Then Next Wave

After all plans in a wave complete:
1. Confirm all plans show `completed` status
2. Only then proceed to the next wave

```bash
pm plan list --phase <phase-id> --json
```

---

## Step 4: Verify Phase Goal

After all waves complete:

1. Review phase objective from `pm phase show <phase-id>`
2. Check all must-haves against actual codebase (not claims)
3. Run verification commands (build, tests, etc.)

```bash
npm run build
npm test
```

**Route by result:**
- **PASS** → Continue to Step 5
- **FAIL** → Create gap closure plans and retry

---

## Step 5: Commit Phase Completion

```bash
git add -A
git commit -m "docs(phase-{N}): complete {phase-name}"
```

### Update Project Files

After committing, update the project state files:

1. **`.pm/ROADMAP.md`** — update phase status, plan completion counts
2. **`.pm/STATE.md`** — update current position, last action, next steps

---

## Step 6: Track Progress

```bash
pm progress
```

---

## Context Hygiene

**After 3 failed debugging attempts on the same issue:**
1. Stop current approach
2. Record what was tried via `pm context set debug-attempts "{approaches tried}"`
3. Recommend pausing for a fresh session (`/pause`)

---

## Cascading Behavior

- Starting a plan (`pending → in_progress`) auto-starts the parent phase if `not_started`
- Completing all plans in a phase auto-completes the phase
- Failed plans block phase auto-completion

## Git Rules Summary

| When | Command |
|------|---------|
| After each plan | `git add -A && git commit -m "feat(phase-{N}): {plan-name}"` |
| After phase verified | `git add -A && git commit -m "docs(phase-{N}): complete {phase-name}"` |

## Related Workflows

| Workflow | Relationship |
|----------|-------------|
| Plan Phase | Creates plans that this workflow executes |
| Verify Work | Validates deliverables after execution |
| Debug | Use when plans fail verification |
| Fix Bug | Fix blocking bugs before execution |
| Pause | Use after 3 debugging failures |
| Progress | Check milestone progress |

## Offer Next Steps

Present the phase result and suggest next actions:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM CLI ► PHASE EXECUTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase {N}: {name}
Plans completed: {X}/{Y}
Status: {completed ✓ / in_progress ⚠ / failed ✗}

───────────────────────────────────────────────────────

▶ NEXT

/pm-verify-work  — Validate deliverables with empirical evidence
/pm-progress     — Check overall milestone progress
/pm-execute-phase — Continue to the next phase
/pm-pause        — Pause session and save state
───────────────────────────────────────────────────────
```
