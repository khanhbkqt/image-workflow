---
description: Install pm-cli agent config for AI coding clients
---

# Install Workflow

Install pm-cli agent configuration files for one or more AI coding clients.

## When to Use

After setting up a project with `pm init`, install agent config so AI coding tools can use pm workflows.

## Prerequisites

- Project initialized with `pm init`

---

## Step 1: Detect Available Clients

```bash
pm install --detect --json
```

Supported clients:
| Client | Config Format | Location |
|--------|--------------|----------|
| Antigravity | `.agent/workflows/*.md` + `.agent/rules/*.md` | MD + YAML frontmatter |
| Claude Code | `CLAUDE.md` (root) | Markdown with rules |
| Cursor | `.cursor/rules/*.mdc` | MD with YAML frontmatter |
| Codex | `AGENTS.md` (root) | Markdown |
| OpenCode | `AGENTS.md` + `opencode.json` | MD + JSON config |
| Gemini CLI | `GEMINI.md` (root) | Markdown |

---

## Step 2: Install for a Specific Client

```bash
pm install <client>
```

Example:
```bash
pm install antigravity
pm install cursor
pm install claude-code
```

Or install for all detected clients:

```bash
pm install --all
```

---

## Step 3: Verify Installation

Check that config files were created:

```bash
# For Antigravity
ls .agent/workflows/pm-*.md

# For Cursor
ls .cursor/rules/pm-*.mdc

# For Claude Code
cat CLAUDE.md | head -20
```

---

## Step 4: Uninstall (if needed)

```bash
pm install <client> --clean
```

This removes all pm-generated config files for the specified client.

## Success Criteria

- [ ] Config files generated for target client(s)
- [ ] Workflow instructions accessible to the AI client
- [ ] No existing non-pm config files overwritten

## Offer Next Steps

Present the installation result and guide the user:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM CLI ► PM AGENT INSTALLED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Agent config installed for: {client}
Workflows are now available in your AI assistant.

───────────────────────────────────────────────────────

▶ NEXT

/pm-new-project — Initialize a project with pm
/pm-help        — See all available workflows
───────────────────────────────────────────────────────
```
