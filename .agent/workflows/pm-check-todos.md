---
description: Review and prioritize pending todo items
---

# Check Todos Workflow

List pending todo items, prioritize them, and decide what to work on next.

## When to Use

When you have free cycles, at the start of a session, or periodically to keep track of deferred work.

---

## Step 1: List Pending Todos

```bash
pm context search "todo" --json
```

This returns all context entries with "todo" in the key or value.

---

## Step 2: Review and Prioritize

Sort the results by urgency:
1. **Critical** — blocking other work
2. **High** — should be done soon
3. **Medium** — do when convenient
4. **Low** — nice to have

---

## Step 3: Act on Items

**Option A: Work on it now** — start implementing

**Option B: Create a plan** — if it's substantial enough:

```bash
pm plan create "<description>" --phase <phase-id> --number <n>
```

**Option C: Defer** — leave it as context for later

**Option D: Done** — if already resolved, clean up the context entry

---

## Tips

- Check todos at the start of each session
- Don't let critical items pile up
- Convert substantial todos into plans for proper tracking

## Success Criteria

- [ ] All pending todos reviewed
- [ ] Next action selected (or all items addressed)

## Offer Next Steps

Present the todo list and recommend what to tackle next:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM CLI ► TODO REVIEW COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pending todos: {N} items reviewed
Critical: {X} | High: {Y} | Medium: {Z} | Low: {W}

───────────────────────────────────────────────────────

▶ NEXT

/pm-execute-phase — Work on the current phase plan
/pm-add-todo      — Capture additional items discovered
───────────────────────────────────────────────────────
```
