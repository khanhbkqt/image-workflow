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

## Next Steps

→ [Execute Phase](pm-execute-phase.md) — work on a plan
→ [Add Todo](pm-add-todo.md) — capture new items
