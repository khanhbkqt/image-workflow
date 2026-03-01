---
description: Deep technical research for a phase before planning
---

# Research Phase Workflow

Conduct technical research to inform planning decisions for a phase. Run before [Plan Phase](pm-plan-phase.md) when the problem space is unclear.

## When to Use

When you need to:
- Evaluate technology options before committing
- Understand unfamiliar APIs or libraries
- Make architectural decisions with confidence

## Discovery Levels

| Level | Time | Use When |
|-------|------|----------|
| 0 | 0 min | Already know, just doing it |
| 1 | 2–5 min | Single library, confirming syntax |
| 2 | 15–30 min | Choosing between options, new integration |
| 3 | 1+ hour | Architectural decision, novel problem |

Default: Level 2 unless specified.

---

## Step 1: Load Phase Context

```bash
pm phase show <phase-id> --json
pm progress --json
```

Review the phase objective and understand what needs to be researched.

---

## Step 2: Identify Research Questions

What needs to be understood before planning?

- Technology choices and trade-offs
- API capabilities and limitations
- Integration approaches
- Edge cases and failure modes

---

## Step 3: Conduct Research

**Level 1:** Quick verification — check official docs, confirm API/syntax.

**Level 2:** Comparison research — compare 2–3 options, evaluate trade-offs, make recommendation.

**Level 3:** Deep dive — prototype if needed, research edge cases, document unknowns.

Use [Web Search](pm-web-search.md) for external research.

---

## Step 4: Record Findings

Store key decisions and findings:

```bash
pm context set "research-phase-<N>" \
  "<summary of findings, decisions, and recommendations>" \
  --category decision

pm context set "research-phase-<N>-deps" \
  "<dependencies identified: package@version — purpose>" \
  --category note
```

---

## Step 5: Commit Research

```bash
git add -A
git commit -m "docs(phase-<N>): research complete"
```

## Success Criteria

- [ ] Research questions answered
- [ ] Approach selected with rationale
- [ ] Dependencies identified
- [ ] Findings recorded via `pm context set`

## Next Steps

→ [Plan Phase](pm-plan-phase.md) — create plans informed by research
→ [Discuss Phase](pm-discuss-phase.md) — clarify scope with user
