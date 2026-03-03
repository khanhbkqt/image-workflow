---
description: Discuss and clarify phase scope before planning
---

# Discuss Phase Workflow

Review a phase's scope and record key decisions before creating plans. This is a lightweight pre-planning step.

## When to Use

Before planning a phase that has unclear scope, open questions, or multiple possible approaches. Skip this for simple phases with obvious scope.

## Prerequisites

- Phase exists (`pm phase list`)

---

## Step 0: Quick Trace (Context Recovery)

Before discussing scope, restore context:

1. **Read `.pm/ROADMAP.md`**
   - Identify the active milestone and its must-haves
   - Read the current phase's objective
2. **Read `.pm/STATE.md`**
   - Check where the last session left off

_This ensures your discussion is grounded in the project's actual goals._

---

## Step 1: Review Phase Details

```bash
pm phase list --json
```

Find the target phase and note its DB integer ID.

```bash
pm phase show <phase-id>
```

> **Note:** `pm phase show` takes the DB integer ID, not the phase number. Use `pm phase list --json` to find the correct ID.

Review the phase name and description to understand the intended scope.

---

## Step 2: Clarify Scope

Discuss with the team or review relevant documentation to answer:

- What's in scope vs. out of scope?
- Are there technical decisions that need to be made first?
- What dependencies exist on other phases?
- What are the key risks?

---

## Step 3: Record Decisions

Use context to store key decisions for future reference:

```bash
pm context set phase:<phase-id>:scope "<scope summary>"
```

```bash
pm context set phase:<phase-id>:approach "<chosen approach>"
```

```bash
pm context set phase:<phase-id>:risks "<identified risks>"
```

---

## Step 4: Proceed to Planning

Once scope is clear:

→ [Plan Phase](pm-plan-phase.md) — create execution plans

---

## When to Skip

- Phase has a clear, unambiguous description
- No open questions or trade-offs
- Similar phases have been done before

## Step 5: Commit Decisions

If scope decisions were significant:

```bash
git add -A
git commit -m "docs(phase-{N}): scope decisions recorded"
```

---

## Success Criteria

- [ ] Phase scope is understood
- [ ] Key decisions are recorded via `pm context set`
- [ ] Ready to create plans

## Git Rules

| When | Command |
|------|---------|
| After scope decisions recorded | `git add -A && git commit -m "docs(phase-{N}): scope decisions recorded"` |

## Related Workflows

| Workflow | Relationship |
|----------|-------------|
| Plan Phase | Create plans after discussion |
| Research Phase | Deep research if needed |
| Add Phase | If new phase is warranted |

## Offer Next Steps

Present the recorded decisions and suggest the next action:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM CLI ► SCOPE DISCUSSION COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase {N}: {name} — scope is now clear.
Key decisions recorded via pm context.

───────────────────────────────────────────────────────

▶ NEXT

/pm-plan-phase    — Decompose the phase into executable plans
/pm-research-phase — Deep-dive on uncertain areas first
───────────────────────────────────────────────────────
```
