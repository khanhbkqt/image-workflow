---
description: Update pm-cli to the latest version
---

# Update Workflow

Update pm-cli to the latest version.

## When to Use

When a newer version of pm-cli is available and you want the latest features and fixes.

---

## Step 1: Check Current Version

```bash
pm --version
```

---

## Step 2: Update via npm

```bash
npm update -g @pm-cli/pm
```

Or if installed locally:

```bash
npm update @pm-cli/pm
```

---

## Step 3: Verify Update

```bash
pm --version
pm --help
```

Confirm the version has changed and commands work correctly.

---

## Step 4: Re-install Agent Config (if needed)

If the update includes new workflows or changed instructions:

```bash
pm install <client>
```

This regenerates the agent config files with the latest workflow content.

## Success Criteria

- [ ] pm-cli updated to latest version
- [ ] `pm --version` shows new version
- [ ] Commands work correctly
- [ ] Agent config re-installed if needed

## Offer Next Steps

Present the update result and suggest next actions:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM CLI ► PM-CLI UPDATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

pm-cli updated to latest version.
Agent config re-installed if needed.

───────────────────────────────────────────────────────

▶ NEXT

/pm-whats-new — See what changed in the update
/pm-help      — Review available workflows
───────────────────────────────────────────────────────
```

