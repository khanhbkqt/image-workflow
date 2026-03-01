---
description: Track and resolve bugs systematically
---

# Debug Workflow

Use context and plans to track a debugging session — from discovery through resolution.

## When to Use

When you encounter a bug or unexpected behavior that needs systematic investigation.

---

## Step 1: Record the Bug

Log the issue as context for tracking:

```bash
pm context set "debug:issue" "<description of what's wrong>" --category note
```

**Example:**

```bash
pm context set "debug:issue" "API returns 500 on milestone creation when goal contains special characters" --category note
```

---

## Step 2: Investigate

As you investigate, record findings:

```bash
pm context set "debug:hypothesis" "<your theory>"
pm context set "debug:findings" "<what you discovered>"
```

**Example:**

```bash
pm context set "debug:hypothesis" "SQL injection protection is too aggressive"
pm context set "debug:findings" "Found: goal parameter not properly escaped in db.ts line 42"
```

---

## Step 3: Fix and Verify

Implement the fix, then verify it works with empirical evidence (test output, curl response, etc.).

```bash
npm test
# or
pm progress  # verify state is consistent
```

---

## Step 4: Record Resolution

```bash
pm context set "debug:resolution" "<what fixed the issue and how>"
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
2. Record what was tried via `pm context set`
3. Consider pausing → [Pause Work](pm-pause.md) for fresh session

## Success Criteria

- [ ] Bug identified and documented
- [ ] Fix implemented and verified with proof
- [ ] Resolution recorded in context

## Next Steps

→ [Resume Work](pm-resume.md) — if you paused during debugging
→ [Check Progress](pm-progress.md) — verify overall state
