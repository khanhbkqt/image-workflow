---
description: PM Collaboration - How to hand off plans and coordinate between agents
---

# PM Collaboration & Work Handoff

## Plan Handoff

```bash
# Agent A creates a plan and records context for Agent B
pm plan create "Review auth implementation" --phase <id> --number 3 --wave 1
pm context set "plan-3:focus" "Focus on: token expiry, error responses, CORS" --category note

# Agent B picks up
pm plan list --phase <id> --status pending --json
pm plan update <plan-id> --status in_progress
# ... do work, record findings via context ...
pm plan update <plan-id> --status completed
```

## Shared Decisions

```bash
# Always check before deciding
pm context search "test" --json
# If empty → safe to decide
pm context set "test-framework" "vitest" --category decision --json
# If exists → respect it or create a proposal via context
```

## Work Decomposition

```bash
# Create plans within a phase for different agents
pm plan create "Implement registration" --phase <id> --number 1 --wave 1
pm plan create "Implement login" --phase <id> --number 2 --wave 1
pm plan create "Write tests" --phase <id> --number 3 --wave 2

# Monitor progress
pm plan list --phase <id> --json
pm progress
```
