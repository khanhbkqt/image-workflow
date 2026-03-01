---
description: Create and activate a new milestone with phases
---

# New Milestone Workflow

Create a new milestone, set its goal, activate it, and add initial phases.

## When to Use

When starting a new body of work — a feature set, version release, or major initiative.

## Prerequisites

- Project initialized (`pm init` has been run)
- Requirements clarified (SPEC.md exists or equivalent)

---

## Step 1: Clarify Requirements

Before creating a milestone, define what you're building:

→ **Run the [Brainstorm](pm-brainstorm.md) workflow** if requirements are unclear.

*Do not proceed until SPEC.md has Status: FINALIZED.*

---

## Step 2: Create the Milestone

```bash
pm milestone create <slug> "<name>" --goal "<goal description from SPEC>"
```

**Example:**
```bash
pm milestone create v2.0-auth "Authentication System" --goal "Add user authentication per Spec"
```

---

## Step 3: Activate the Milestone

```bash
pm milestone update <slug> --status active
```

**Cascading:** Activating a milestone deactivates any currently-active milestone (single-active rule).

---

## Step 4: Add Phases

Break the milestone into 3-5 phases based on SPEC goals:

```bash
pm phase add "Database Schema" --number 1 --description "Create auth tables and models"
pm phase add "API Endpoints" --number 2 --description "Login, register, token refresh"
pm phase add "Integration Tests" --number 3 --description "End-to-end auth flow tests"
```

**Phase rules:**
- 3-5 phases per milestone
- Each phase has a clear deliverable
- Dependencies flow forward (Phase 2 depends on Phase 1)
- All phases start as `not_started`

---

## Step 5: Verify and Commit

```bash
pm progress
```

Confirm the milestone is active and phases match your SPEC.

```bash
git add -A
git commit -m "docs: create milestone <slug> with {N} phases"
```

---

## Git Rules

| When | Command |
|------|---------|
| After milestone + phases created | `git add -A && git commit -m "docs: create milestone <slug> with {N} phases"` |

## Related Workflows

| Workflow | Relationship |
|----------|-------------|
| Discuss Phase | Clarify phase scope before planning |
| Plan Phase | Create executable plans for Phase 1 |
| Progress | Check milestone progress |

## Next Steps

→ [Discuss Phase](pm-discuss-phase.md) — clarify Phase 1 scope (optional)
→ [Plan Phase](pm-plan-phase.md) — create executable plans for Phase 1
