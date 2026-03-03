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

This does **two things**:
1. **Database** — stores brief metadata (id, name, goal, status)
2. **Filesystem** — auto-generates `.pm/milestones/<slug>/MILESTONE.md` from `.pm/templates/milestone.md`

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

Each `pm phase add` does **two things**:
1. **Database** — stores brief metadata (number, name, description, status)
2. **Filesystem** — auto-generates `.pm/milestones/<slug>/<N>/PHASE.md` from `.pm/templates/phase-summary.md`

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

### Update Project Files

1. **`.pm/ROADMAP.md`** — add the new milestone and its phases
2. **`.pm/STATE.md`** — set current position to the new milestone

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

## Offer Next Steps

Present the new milestone structure and suggest the first action:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM CLI ► MILESTONE CREATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Milestone: {slug}
Phases created: {N}

───────────────────────────────────────────────────────

▶ NEXT

/pm-discuss-phase — Clarify Phase 1 scope before planning (optional)
/pm-plan-phase    — Create executable plans for Phase 1
───────────────────────────────────────────────────────
```
