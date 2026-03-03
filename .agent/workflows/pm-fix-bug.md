---
description: Fix a reported bug with systematic tracking
---

# Fix Bug Workflow

Work through a reported bug from investigation to resolution with full status tracking.

## When to Use

When a `pm bug` entry exists and needs to be actively investigated and resolved.

---

## Step 1: Quick Trace

Before starting, understand the surrounding context:

1. **Read `.pm/ROADMAP.md`** — Identify the active milestone and current phase
2. **Read `.pm/STATE.md`** — Check what was happening when the bug was reported

---

## Step 2: Read Bug Details

```bash
pm bug show <id>
```

Understand:
- Description and reproduction steps
- Priority level (critical / high / medium / low)
- Whether it's blocking other work

---

## Step 3: Set Status — Investigating

```bash
pm bug update <id> --status investigating
```

---

## Step 4: Investigate

Search the codebase for relevant code, check logs, and reproduce the issue:

```bash
# Find relevant files
grep -r "<keyword>" src/

# Reproduce
npm test -- --grep "<test name>"
```

Document the root cause once identified.

---

## Step 5: Set Status — Fixing

```bash
pm bug update <id> --status fixing
```

Implement the fix. Keep changes minimal and targeted.

---

## Step 6: Verify

Run tests and confirm the fix with empirical evidence:

```bash
npm test
```

**Never accept:** "It looks correct" or "This should work."

**Always require:** Test output, curl response, or other captured proof.

---

## Step 7: Resolve

```bash
pm bug update <id> --status resolved --description "<root cause and fix>"
```

**Example:**

```bash
pm bug update 42 --status resolved --description "Goal field not escaped in db.ts:42 — fixed with parameterized query"
```

---

## Step 8: Commit

```bash
git add -A
git commit -m "fix: <description of what was fixed>"
```

---

## 3-Strike Rule

If you cannot identify the root cause after 3 attempts:
1. Stop the current approach
2. Record attempts: `pm bug update <id> --description "<what was tried>"`
3. Pause for a fresh session → [Pause Work](pm-pause.md)

---

## Success Criteria

- [ ] Bug status transitions: `open → investigating → fixing → resolved`
- [ ] Root cause identified and documented in bug record
- [ ] Fix verified with empirical proof (test output, etc.)
- [ ] Fix committed with `fix:` commit type

## Related Workflows

| Workflow | Relationship |
|----------|-------------|
| Debug | General debugging session (use when bug is not yet formally reported) |
| Execute Phase | Checks for blocking bugs before running plans |
| Pause | Use after 3 failed fix attempts |
| Resume | Restore context after pausing |

## Offer Next Steps

Present the fix result and suggest what to do next:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM CLI ► BUG FIXED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bug #{id}: {description}
Status: resolved ✓
Fix committed: fix: {description}

───────────────────────────────────────────────────────

▶ NEXT

/pm-execute-phase — Resume plan execution
/pm-debug         — Start a new debugging session for another issue
/pm-pause         — Pause session (if 3-strike reached)
───────────────────────────────────────────────────────
```
