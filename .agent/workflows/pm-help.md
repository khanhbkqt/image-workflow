---
description: Show all available pm workflows and commands
---

# Help Workflow

Display all available pm workflows and CLI commands.

## Step 1: Show CLI Commands

```bash
pm --help
```

## Step 2: Available Workflows

| Workflow | Description |
|----------|-------------|
| **Core Lifecycle** | |
| map | Analyze codebase → ARCHITECTURE.md |
| plan-phase | Create execution plans for a phase |
| execute-phase | Wave-based execution with status transitions |
| verify-work | Validate deliverables against requirements |
| debug | Systematic debugging with persistent state |
| **Project Setup** | |
| new-project | Initialize a new pm project |
| new-milestone | Create a milestone with phases |
| complete-milestone | Archive a completed milestone |
| audit-milestone | Review milestone quality |
| brainstorm | Interactive ideation and requirements |
| **Phase Management** | |
| add-phase | Add phase to end of milestone |
| insert-phase | Insert phase at position (renumbers) |
| remove-phase | Remove phase (with safety checks) |
| discuss-phase | Clarify scope before planning |
| research-phase | Deep technical research for a phase |
| list-phase-assumptions | Surface planning assumptions |
| plan-milestone-gaps | Create gap closure plans |
| **Navigation & State** | |
| progress | Show current milestone progress |
| pause | Save state for session handoff |
| resume | Restore from last session |
| add-todo | Quick capture an idea |
| check-todos | List pending items |
| **Utilities** | |
| help | Show this help |
| install | Install pm agent config |
| update | Update pm-cli to latest |
| whats-new | Show recent changes |
| web-search | Search the web for research |

## Quick Start

1. `pm init` → Initialize project
2. `pm milestone create "v1.0" --goal "MVP"` → Create milestone
3. `pm phase create "Foundation" --milestone <id> --number 1` → Add phase
4. `pm plan create "Setup" --phase <id> --number 1` → Create plan
5. `pm plan update <id> --status in_progress` → Start work
6. `pm plan update <id> --status completed` → Finish work
7. `pm progress` → Check progress

## Success Criteria

- [ ] User understands available commands and workflows
