---
description: Show recent pm-cli changes and new features
---

# What's New Workflow

Display recent changes, new features, and improvements to pm-cli.

## Step 1: Check Current Version

```bash
pm --version
```

## Step 2: View Changelog

Check the CHANGELOG or release notes:

```bash
# If CHANGELOG.md exists in the project
cat CHANGELOG.md | head -80

# Or check npm for release info
npm info @pm-cli/pm version
```

## Step 3: Review Recent Updates

Display the latest version changes, including:
- New commands or flags
- Bug fixes
- Breaking changes
- Updated workflows

## Step 4: Check for Updates

```bash
npm outdated -g @pm-cli/pm
```

If an update is available, use [Update](pm-update.md) to install it.

## Success Criteria

- [ ] Current version identified
- [ ] Recent changes reviewed
- [ ] Update availability checked

## Offer Next Steps

Present what's new and suggest next actions:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM CLI ► WHAT'S NEW REVIEWED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current version: {version}
Update available: {yes / no}

───────────────────────────────────────────────────────

▶ NEXT

/pm-update — Install the latest version
/pm-help   — Review available workflows
───────────────────────────────────────────────────────
```

