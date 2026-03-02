---
description: Create executable plans for a phase with research and verification
---

# Plan Phase Workflow

Decompose a phase into executable plans with task breakdown, dependency analysis, and wave assignment.

## When to Use

After a milestone and phases exist, and you're ready to break a phase into concrete plans.

## Prerequisites

- Milestone is `active` (`pm milestone list --json`)
- Phase exists (`pm phase list --json`)

---

## Step 0: Quick Trace (Context Recovery)

Before planning, you must understand the wider context:

1. **Read `.pm/ROADMAP.md`**
   - Identify the active milestone's goal and must-haves
   - Read the current phase's objective and dependencies
2. **Read `.pm/STATE.md`**
   - Check where the last session left off

_This ensures your plans align with the overall project direction._

---

## Step 1: Validate Phase

```bash
pm phase show <phase-id> --json
```

Extract the phase name, description, and objective. Confirm the phase isn't already completed.

---

## Step 2: Handle Research

Assess the discovery level needed:

| Level | When | Action |
|-------|------|--------|
| Level 0 — Skip | Pure internal work, established patterns | Go to Step 3 |
| Level 1 — Quick | Single known library, confirming syntax | Quick web search, no record needed |
| Level 2 — Standard | Choosing between 2-3 options, new integration | Record findings via `pm context set` |
| Level 3 — Deep | Architectural decision, novel problem | Full research with recorded decisions |

**Record research decisions:**
```bash
pm context set "phase-{N}-research" "{key findings}" --category decision
```

---

## Step 3: Decompose into Plans

### Planning Philosophy

- **Plans are prompts** — each plan IS the execution instruction
- **Aggressive atomicity** — 2-3 tasks per plan max
- **Quality budget** — plans should complete within ~50% context

### Context Quality Curve

| Context Usage | Quality | Rule |
|---------------|---------|------|
| 0-30% | PEAK | Comprehensive work |
| 30-50% | GOOD | Solid output |
| 50-70% | DEGRADING | Efficiency mode |
| 70%+ | POOR | Stop, too many plans |

**The rule:** More plans with smaller scope > fewer plans with large scope.

### Decomposition Steps

0. Fetch the researchs of current phase if any
1. Identify all deliverables for the phase goal
2. Break into atomic tasks (2-3 per plan)
3. Determine dependencies between plans
4. Assign execution waves (independent plans share a wave)

---

## Step 4: Create Plans

Each `pm plan create` does **two things**:

1. **Database** — stores a brief metadata record (name, phase, wave, status)
2. **Filesystem** — auto-generates a comprehensive Markdown file from `.pm/templates/PLAN.md`

The file is written to: `.pm/milestones/<milestone-id>/<phase-number>/<plan-number>-PLAN.md`

```bash
pm plan create "<plan-name>" \
  --phase <phase-id> \
  --number <N> \
  --wave <wave-number>
```

After creation, edit the auto-generated file directly to flesh out the plan details:

```bash
# Edit the auto-generated plan file
$EDITOR .pm/milestones/<milestone-id>/<phase-number>/<N>-PLAN.md
```

### Plan Content Structure

Each auto-generated plan file (`.pm/milestones/.../<N>-PLAN.md`) is pre-populated with:
- **Objective** — What and why
- **Context** — File references needed
- **Tasks** — Specific implementation steps with verification
- **Success criteria** — Measurable outcomes

To view a plan's full content:
```bash
pm plan show <plan-id>
# or read directly:
cat .pm/milestones/<milestone-id>/<phase-number>/<plan-number>-PLAN.md
```

### Updating Plan Content

To update a plan's file content after creation:
```bash
pm plan update <plan-id> --content "<updated content>"
pm plan update <plan-id> --status in_progress
```



## Step 5: Verify Plans (Checker Logic)

For each plan, verify:
- [ ] All referenced files exist or will be created
- [ ] Actions are specific (no vague "implement X")
- [ ] Verification commands are executable
- [ ] Success criteria are measurable
- [ ] Dependencies between plans are correct

**If issues found:** Fix and re-check (max 3 iterations).

---

## Step 6: Update Phase Status

```bash
pm phase update <phase-id> --status planning
```

---

## Step 7: Commit Plans

```bash
git add -A
git commit -m "docs(phase-{N}): create execution plans"
```

### Update Project Files

Update **`.pm/ROADMAP.md`** with plan counts per phase.

---

## Step 8: Display Summary and Next Steps

```
Phase {N} planned:
{X} plans across {Y} waves

Plans:
• {N}.1: {Name} (wave 1)
• {N}.2: {Name} (wave 1)
• {N}.3: {Name} (wave 2)

Next: Execute Phase → pm-execute-phase workflow
```

---

## Git Rules

| When | Command |
|------|---------|
| After plans created | `git add -A && git commit -m "docs(phase-{N}): create execution plans"` |

## Related Workflows

| Workflow | Relationship |
|----------|-------------|
| Map | Run before planning to get codebase context |
| Research Phase | Deep technical research before planning |
| Discuss Phase | Clarify scope before planning |
| Execute Phase | Runs the plans created here |
| Verify Work | Validates executed plans |
