---
description: Track and resolve bugs systematically
---

# Debug Workflow

Use the bug system and plans to track a debugging session — from discovery through resolution.

## When to Use

When you encounter a bug or unexpected behavior that needs systematic investigation.

---

## Step 0: Quick Trace (Context Recovery)

When starting a debug session, first understand what was supposed to happen:

1. **Read `.pm/ROADMAP.md`**
   - Identify the active milestone and the current phase's objective
2. **Read `.pm/STATE.md`**
   - Check what was being worked on when the bug occurred
   - Note any recent completed plans

_This provides the necessary context to understand why the bug matters and what the intended behavior is._

---

## Step 1: Record the Bug

Check if the bug was already reported:

```bash
pm bug list --status open
```

**If an existing bug matches:** Note the ID and skip to Step 2 using that ID.

**If no existing bug:** Report a new one:

```bash
pm bug report "<description>" --priority <level> --blocking
```

**Example:**

```bash
pm bug report "API returns 500 on milestone creation when goal contains special characters" --priority high --blocking
```

Use `--blocking` if this bug blocks plan execution or other work.

---

## Step 2: Investigate

Set the bug to investigating status:

```bash
pm bug update <id> --status investigating
```

Investigate the codebase — search for the root cause, check logs, reproduce the issue.

---

## Step 3: Fix and Verify

Update bug status:

```bash
pm bug update <id> --status fixing
```

Implement the fix, then verify it works with empirical evidence (test output, curl response, etc.):

```bash
npm test
# or
pm progress  # verify state is consistent
```

---

## Step 4: Record Resolution

```bash
pm bug update <id> --status resolved --description "<root cause and fix>"
```

**Example:**

```bash
pm bug update 42 --status resolved --description "Goal parameter was not escaped in db.ts line 42 — fixed with parameterized query"
```

---

## Step 5: Commit the Fix

```bash
git add -A
git commit -m "fix: <description of what was fixed>"
```

---

## 3-Strike Rule

If debugging takes more than 3 attempts without progress:
1. Stop the current approach
2. Update the bug: `pm bug update <id> --status open --description "<what was tried>"`
3. Consider pausing → [Pause Work](pm-pause.md) for fresh session

## Success Criteria

- [ ] Bug reported via `pm bug report` with correct priority
- [ ] Fix implemented and verified with empirical proof
- [ ] Bug resolved via `pm bug update <id> --status resolved`
- [ ] Fix committed

## Related Workflows

| Workflow | Relationship |
|----------|-------------|
| Fix Bug | Dedicated workflow for fixing a specific reported bug |
| Resume Work | If you paused during debugging |
| Check Progress | Verify overall state after fix |
| Pause | Use after 3 failed debugging attempts |

## Offer Next Steps

Present the resolution and suggest what to do next:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM CLI ► BUG RESOLVED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bug #{id}: {description}
Status: resolved ✓
Root cause: {summary}

───────────────────────────────────────────────────────

▶ NEXT

/pm-execute-phase — Resume plan execution after the fix
/pm-fix-bug       — Fix another reported bug
/pm-pause         — Pause for fresh session (if 3-strike reached)
───────────────────────────────────────────────────────
```
