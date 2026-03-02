---
description: Execute plans in a phase using wave-based ordering
---

# Execute Phase Workflow

Work through a phase's plans in wave order, committing after each plan and verifying at the end.

## When to Use

After plans have been created for a phase (via the Plan Phase workflow) and you're ready to start implementation.

## Prerequisites

- Phase has plans (`pm plan list --phase <phase-id> --json`)
- Plans are in `pending` status

## Rules

- Never execute a plan without reading the full plan from the filesystem
- Never execute a plan without verifying the plan
- Delegate the plan to a sub-agent to implement what the plan describes, keep the context small and focused

---

## Step 0: Quick Trace (Context Recovery)

Before executing any plans, quickly understand the current state:

1. **Read `.pm/ROADMAP.md`**
   - Identify the active milestone and its must-haves
   - Identify the current phase and its objective
2. **Read `.pm/STATE.md`**
   - Check where the last session left off

_This ensures you don't execute plans blindly without understanding the wider phase goal._

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
| Pause | Use after 3 debugging failures |
| Progress | Check milestone progress |
