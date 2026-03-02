---
description: Initialize a new project with pm
---

# New Project Workflow

Bootstrap a new project from scratch — initialize git, the database, and create the first milestone with phases.

## When to Use

When starting a brand new project that will be managed with `pm`. This is the first workflow to run.

## Prerequisites

- `pm` CLI is installed

---

## Step 1: Initialize Git

```bash
if [ ! -d ".git" ]; then
    git init
fi
```

---

## Step 2: Detect Existing Code (Brownfield Check)

```bash
find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.go" \) \
    -not -path '*/node_modules/*' -not -path '*/.git/*' | head -20
```

**If existing code found:**
- Consider running the Map workflow first to understand the architecture
- Ask the user: Map codebase first (recommended) or skip?

**If no existing code:** Continue to Step 3.

---

## Step 3: Initialize the Project

```bash
pm init
```

This creates the local pm database and configuration.

---

## Step 4: Deep Questioning

This is the most leveraged moment in the project. Deep questioning here saves hours later.

**Open the conversation:**

Ask: "What do you want to build?"

**Follow the thread with probing questions:**
- Challenge vagueness: "When you say 'fast', what does that mean specifically?"
- Make abstract concrete: "Give me an example of how a user would..."
- Surface assumptions: "You're assuming users will... Is that validated?"
- Find edges: "What's explicitly NOT in scope?"
- Reveal motivation: "Why does this matter now?"

**Context checklist (gather naturally, not as interrogation):**
- [ ] Vision — What does success look like?
- [ ] Users — Who is this for?
- [ ] Problem — What pain does it solve?
- [ ] Scope — What's in, what's out?
- [ ] Constraints — Technical, timeline, budget?

**Decision gate:** When you can write a clear SPEC, ask: "Ready to create SPEC.md?"

---

## Step 5: Create SPEC.md

Write a `SPEC.md` with:
- Vision, Goals, Non-Goals
- Users, Constraints
- Success Criteria (measurable)
- Status: `FINALIZED`

*Do not proceed until SPEC.md has Status: FINALIZED.*

---

## Step 6: Create the First Milestone

```bash
pm milestone create <slug> "<name>" --goal "<goal from SPEC>"
pm milestone update <slug> --status active
```

This stores brief metadata in the database and auto-generates `.pm/milestones/<slug>/MILESTONE.md` from `.pm/templates/milestone.md`.

---

## Step 7: Add Initial Phases

Break the milestone into 3-5 phases based on SPEC goals:

```bash
pm phase add "Foundation & Setup" --number 1 --description "Project setup and schema"
pm phase add "Core Feature A" --number 2 --description "Implement Feature A"
pm phase add "Core Feature B" --number 3 --description "Implement Feature B"
```

Each call stores brief metadata in the database and auto-generates `.pm/milestones/<slug>/<N>/PHASE.md` from `.pm/templates/phase-summary.md`.

**Phase creation rules:**
- 3-5 phases per milestone
- Each phase has a clear deliverable
- Dependencies flow forward

---

## Step 8: Verify Setup

```bash
pm progress
```

Confirm the milestone is active and phases match your SPEC.

---

## Step 9: Initial Commit

```bash
git add -A
git commit -m "chore: initialize project

- pm database and config
- SPEC.md with vision and goals
- Milestone with {N} phases"
```

---

## Git Rules

| When | Command |
|------|---------|
| After project setup | `git add -A && git commit -m "chore: initialize project"` |

## Related Workflows

| Workflow | Relationship |
|----------|-------------|
| Map | Run before new-project for brownfield codebases |
| Discuss Phase | Clarify scope before planning (optional) |
| Plan Phase | Create Phase 1 execution plans |

## Next Steps

→ [Discuss Phase](pm-discuss-phase.md) — clarify Phase 1 scope (optional)
→ [Plan Phase](pm-plan-phase.md) — create executable plans for Phase 1
