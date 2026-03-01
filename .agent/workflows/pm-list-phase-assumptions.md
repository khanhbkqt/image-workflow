---
description: List assumptions made during phase planning
---

# List Phase Assumptions Workflow

Surface and document assumptions made during phase planning that should be validated before execution.

## When to Use

After planning a phase, before executing — to identify risks and validate assumptions.

## Prerequisites

- Phase has plans (`pm plan list --phase <phase-id> --json`)

---

## Step 1: Load Phase Plans

```bash
pm plan list --phase <phase-id> --json
```

Review each plan's content for implicit and explicit assumptions.

---

## Step 2: Extract Assumptions

Scan plans for:
- Technology choices without justification
- Implied dependencies ("this API exists", "library supports X")
- Expected behaviors not verified
- Time/complexity estimates
- Scope boundaries ("we don't need to handle Y")

---

## Step 3: Categorize Assumptions

| Category | Examples | Risk Level |
|----------|----------|------------|
| Technical | API exists, library works, syntax correct | Medium |
| Integration | Services compatible, auth works across modules | High |
| Scope | Feature boundaries, what's excluded | Medium |
| Performance | Will handle load, fast enough | High |
| Timeline | Estimates accurate, no blockers | Low |

---

## Step 4: Record Assumptions

Store assumptions as context for the team:

```bash
pm context set "phase-<N>-assumptions" \
  "<categorized assumptions list>" \
  --category note
```

---

## Step 5: Validate High-Risk Assumptions

For high-risk assumptions:
1. Write a quick test or proof-of-concept
2. Check official documentation
3. Use [Web Search](pm-web-search.md) or [Research Phase](pm-research-phase.md)

## Success Criteria

- [ ] All assumptions identified and categorized
- [ ] High-risk assumptions validated or flagged
- [ ] Assumptions recorded in context for team visibility

## Next Steps

→ [Research Phase](pm-research-phase.md) — deep dive on uncertain areas
→ [Execute Phase](pm-execute-phase.md) — proceed with validated assumptions
