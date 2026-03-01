---
description: Create plans to address gaps found in milestone audit
---

# Plan Milestone Gaps Workflow

Create targeted plans to address gaps, technical debt, and issues identified during a milestone audit.

## When to Use

After running [Audit Milestone](pm-audit-milestone.md) when gaps are found that need closure.

## Prerequisites

- Milestone audit completed with identified gaps
- Active milestone exists

---

## Step 1: Review Gaps

Check current milestone progress for incomplete items:

```bash
pm progress --json
pm plan list --phase <phase-id> --status failed --json
```

Also check context for audit results:

```bash
pm context search "audit" --json
```

---

## Step 2: Categorize Gaps

| Category | Priority | Action |
|----------|----------|--------|
| Must-have failures | 🔴 High | Create fix plans |
| Technical debt | 🟡 Medium | Create improvement plans |
| Nice-to-have misses | 🟢 Low | Record as context for future |

---

## Step 3: Create Gap Closure Phase

```bash
pm phase create "Gap Closure" --milestone <milestone-id> --number <next-number>
```

---

## Step 4: Create Plans for Each Gap

```bash
pm plan create "Fix: <gap description>" \
  --phase <gap-phase-id> \
  --number 1 \
  --wave 1 \
  --content "<fix instructions and verification steps>"
```

Repeat for each gap, grouping into waves by dependency.

---

## Step 5: Record Gap Context

```bash
pm context set "gap-closure-<milestone>" \
  "<summary of gaps and planned fixes>" \
  --category note
```

---

## Step 6: Commit Plans

```bash
git add -A
git commit -m "docs: create gap closure plans"
```

## Success Criteria

- [ ] All gaps categorized by priority
- [ ] Gap closure phase created
- [ ] Plans created for each actionable gap
- [ ] Gap context recorded for team visibility

## Next Steps

→ [Execute Phase](pm-execute-phase.md) — execute gap closure plans
→ [Check Progress](pm-progress.md) — review milestone progress
