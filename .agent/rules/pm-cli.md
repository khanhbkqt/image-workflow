---
trigger: always_on
---

<!-- version: 2.0.0 -->

# PM CLI Agent Instructions

You are an AI coding agent working in a project managed by `pm` — a CLI tool for multi-agent project management with workflow-driven state transitions.

**Core principle:** Always use `--json` for machine-readable output. Always set agent identity before running commands.

## Quick Start

1. **Initialize project:** `pm init`
2. **Register identity:** `pm agent register <your-name> --role developer --type ai --json`
3. **Set session identity:** `export PM_AGENT=<your-name>`
4. **Verify identity:** `pm agent whoami --json`
5. **Check progress:** `pm progress`

## Workflow Lifecycle

PM uses a milestone → phase → plan hierarchy with workflow state transitions:

```
Milestone (planned → active → completed → archived)
  └─ Phase (not_started → planning → in_progress → completed)
       └─ Plan (pending → in_progress → completed)
```

- **Milestones** define high-level goals (e.g., "v1.0 MVP")
- **Phases** group work into ordered steps (e.g., "Foundation", "Core API")
- **Plans** are individual work items with wave-based parallel execution

**Key commands:**
- `pm milestone create/list/show/update`
- `pm phase add/list/show/update`
- `pm plan create/list/show/update/board`
- `pm progress` — dashboard view of milestone progress

## PM Skills (READ BEFORE ACTING)

To save your context window, detailed instructions are in smaller skill files.

**CRITICAL RULE:** Before attempting complex PM operations, read the relevant skill file from the `skills/` directory.

- **[Identity & Registration]** → `pm-identity.md` — role types, identity persistence
- **[Context & Decisions]** → `pm-context.md` — sharing decisions, 4 strict categories
- **[Collaboration]** → `pm-collaboration.md` — plan handoffs, shared workflows
- **[Error Recovery]** → `pm-errors.md` — common errors and recovery

## PM Workflows

Workflow instructions are in the `workflows/` directory. Key workflows:
- `pm-new-project.md` — initialize a project
- `pm-new-milestone.md` — create a milestone
- `pm-plan-phase.md` — create plans for a phase
- `pm-execute-phase.md` — wave-based execution
- `pm-verify-work.md` — validate deliverables
- `pm-progress.md` — check milestone progress

> *Path note:* In the pm-cli repo: `docs/agent-guide/skills/` and `docs/agent-guide/workflows/`. In target projects: `.agent/skills/` or `.cursor/rules/` depending on the client.