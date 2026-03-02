---
description: Validate work against requirements with empirical evidence
---

# Verify Work Workflow

Confirm that implemented work meets requirements with documented proof. The verifier checks the CODEBASE, not claims.

## When to Use

After executing a phase's plans, before marking the phase as complete.

## Prerequisites

- Phase plans have been executed
- Phase has completed plans (`pm plan list --phase <phase-id> --json`)

---

## Step 0: Quick Trace (Context Recovery)

Before verifying, restore context to understand what needs verification:

1. **Read `.pm/ROADMAP.md`**
   - Identify the active milestone and its must-haves
   - Read the current phase's objective and must-haves
2. **Read `.pm/STATE.md`**
   - Check where the last execution session left off

_This ensures you verify the actual goals, not just what the plans happened to build._

---

## Step 1: Load Verification Context

```bash
pm phase show <phase-id> --json
pm plan list --phase <phase-id> --json
pm progress
```

Extract the phase objective and all deliverables from completed plans.

---

## Step 2: Extract Must-Haves

From the phase definition, identify testable requirements:

```
Must-Haves for Phase {N}:
1. {Requirement 1} — How to verify
2. {Requirement 2} — How to verify
3. {Requirement 3} — How to verify
```

---

## Step 3: Verify Each Must-Have

For each requirement, determine the verification method and execute it:

| Change Type | Required Proof |
|-------------|----------------|
| API endpoint | curl/HTTP response with status code |
| UI change | Screenshot |
| Build/compile | `npm run build` output |
| Tests pass | `npm test` output |
| Config change | Verification command output |
| File created | `ls` or `find` output |

### Forbidden Phrases

**Never accept** these as verification evidence:
- "This should work"
- "The code looks correct"
- "I've made similar changes before"
- "Based on my understanding"
- "It follows the pattern"

**Always require:** Captured command output, screenshot, or test result.

### Record Evidence

For each must-have, record:
- **Status:** PASS or FAIL
- **Evidence:** Actual command output or screenshot
- **Notes:** Any observations

---

## Step 4: Create Verification Report

Record results via context:

```bash
pm context set "phase-{N}-verification" "{X}/{Y} must-haves verified. Verdict: PASS|FAIL" --category note
```

---

## Step 5: Handle Results

### If PASS (all must-haves verified):

```bash
# Commit verification
git add -A
git commit -m "docs(phase-{N}): verification report — PASS"
```

Output:
```
Phase {N} VERIFIED ✓
{X}/{X} must-haves verified
All requirements satisfied.

Next: Execute Phase {N+1} or Complete Milestone
```

### If FAIL (some must-haves failed):

Create gap closure plans for each failure:

```bash
pm plan create "Fix: {issue}" \
  --phase <phase-id> \
  --number <next-number> \
  --wave 1 \
  --content "Problem: {what failed}. Fix: {specific instructions}. Verify: {how to confirm fix}"
```

```bash
git add -A
git commit -m "docs(phase-{N}): verification report — FAIL, gap plans created"
```

Output:
```
Phase {N} GAPS FOUND ⚠
{X}/{Y} must-haves verified
{Z} issues require fixes

Gap closure plans created.
Next: Execute Phase to run fix plans
```

---

## Evidence Requirements Table

| Claim | Required Proof |
|-------|----------------|
| "Tests pass" | Actual test runner output |
| "API works" | curl command + response body |
| "UI renders" | Screenshot |
| "Build succeeds" | Build command output |
| "File created" | `ls` or `find` output |
| "Performance OK" | Benchmark output |

---

## Git Rules

| When | Command |
|------|---------|
| After verification PASS | `git add -A && git commit -m "docs(phase-{N}): verification report — PASS"` |
| After verification FAIL | `git add -A && git commit -m "docs(phase-{N}): verification report — FAIL, gap plans created"` |

## Related Workflows

| Workflow | Relationship |
|----------|-------------|
| Execute Phase | Run before verify to implement work |
| Debug | Diagnose verification failures |
| Plan Phase | Create gap closure plans from failures |
| Progress | Check overall milestone status |
