---
description: Analyze codebase and generate architecture documentation
---

# Map Codebase Workflow

Analyze an existing codebase to understand structure, dependencies, patterns, and technical debt. Produces documentation that enables informed planning.

## When to Use

Before planning on brownfield projects — gives the planner full context about the existing codebase.

---

## Step 1: Validate Project

Confirm this is a valid project with `pm status`:

```bash
pm status --json
```

If not initialized, run `pm init` first.

---

## Step 2: Analyze Project Structure

Scan the project directory structure:

```bash
# Find source directories (exclude noise)
find . -type d -not -path '*/node_modules/*' -not -path '*/.git/*' \
  -not -path '*/dist/*' -not -path '*/build/*' | head -50
```

Identify:
- Source directories (`src/`, `lib/`, `app/`)
- Test directories (`tests/`, `__tests__/`)
- Configuration files
- Entry points

---

## Step 3: Analyze Dependencies

```bash
# Node.js
cat package.json | jq '.dependencies'
cat package.json | jq '.devDependencies'
npm outdated
```

For each dependency note: name, version, purpose, actively used.

---

## Step 4: Map Data Flow

Search for integration points:

```bash
# API calls
grep -rE 'fetch\(|axios\.|http\.' src/

# Database connections
grep -rE 'DATABASE_URL|mongodb|postgres|mysql|sqlite' .

# Third-party services
grep -rE 'stripe|sendgrid|twilio|aws-sdk' .
```

---

## Step 5: Identify Technical Debt

```bash
# TODOs and FIXMEs
grep -rE 'TODO|FIXME|HACK|XXX' src/

# Deprecated markers
grep -rE '@deprecated|DEPRECATED' .
```

---

## Step 6: Record Findings

Store key architecture decisions and findings:

```bash
pm context set "architecture-overview" \
  "<high-level description of the system>" \
  --category note

pm context set "tech-stack" \
  "<runtime, frameworks, key dependencies>" \
  --category note
```

Write findings to `docs/ARCHITECTURE.md` (or project-appropriate location).

---

## Step 7: Commit Documentation

```bash
git add docs/ARCHITECTURE.md
git commit -m "docs: map existing codebase"
```

## Success Criteria

- [ ] Project structure documented
- [ ] Dependencies analyzed
- [ ] Data flow mapped
- [ ] Technical debt identified
- [ ] Findings recorded via `pm context set`

## Next Steps

→ [Plan Phase](pm-plan-phase.md) — create plans with full codebase context
→ [Research Phase](pm-research-phase.md) — deep dive on specific areas
