---
description: Quickly capture a todo item for later
---

# Add Todo Workflow

Capture an idea, issue, or deferred item without interrupting your current work.

## When to Use

When you notice something that needs doing but don't want to context-switch right now.

---

## Step 1: Record the Todo

Use context to store the todo item:

```bash
pm context set "todo:<short-key>" "<description>" --category note
```

**Examples:**

```bash
pm context set "todo:update-readme" "Update README with new CLI commands" --category note
pm context set "todo:refactor-errors" "Refactor error handling in phase module — messages are too vague" --category note
pm context set "todo:add-tests" "Add integration tests for milestone completion edge cases" --category note
```

---

## Tips

- Use `todo:` prefix for easy searching later
- Keep descriptions actionable — what needs to be done, not just what's wrong
- Add relevant context (file names, line numbers) while it's fresh

## Success Criteria

- [ ] Todo recorded via `pm context set`
- [ ] Searchable with `pm context search "todo"`

## Next Steps

→ [Check Todos](pm-check-todos.md) — review and prioritize pending items
