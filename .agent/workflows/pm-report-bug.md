---
description: Assist user in creating a detailed, properly formatted bug report from a brief description
---

# /report-bug Workflow

<objective>
Take a brief, potentially incomplete bug description from the user, analyze the context, ask necessary clarifying questions, and generate a properly formatted, actionable bug report.
</objective>

<context>
Run WHEN:
- User types `/report-bug [brief description]`
- User encounters an issue, error, or unexpected behavior but doesn't have time to write a full report
- Missing steps to reproduce, expected behavior, or environmental context need to be extracted or inferred
</context>

<process>

## 1. Initial Analysis & Context Gathering

When the user gives a brief bug description:
1. **Acknowledge the issue:** Let the user know you are looking into it.
2. **Scan Context:** Quickly scan recent workspace context (compile errors, terminal logs, recent file changes, active tasks).
3. **Identify Gaps:** Determine what is missing from a standard bug report (e.g., exact reproduction steps, actual vs expected behavior, stack traces).

---

## 2. Clarification & Investigation

If the issue is obvious from the context, skip to step 3. Otherwise:

Ask the user targeted, concise questions to fill in the gaps:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM CLI ► ANALYZING BUG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I see you're running into: "{brief description}"

To properly document this, I just need a quick clarification:
1. {Question 1, e.g., "What was the exact command you ran?"}
2. {Question 2, e.g., "Did it crash immediately or output a specific error?"}

(If you're not sure, just let me know and I'll investigate the codebase/logs directly)
───────────────────────────────────────────────────────
```

*Agent Proactivity:* Independently use `grep_search`, `read_terminal`, or `view_file` to investigate the issue and attempt to reproduce or locate the faulty code locally.

---

## 3. Format the Bug Report

Once sufficient context is gathered, structure the bug report using a comprehensive, standardized format:

```markdown
# Bug: {Clear, concise title}

## Description
{Detailed description of the problem based on analysis}

## Steps to Reproduce
1. {Step 1}
2. {Step 2}

## Expected Behavior
{What should have happened}

## Actual Behavior
{What actually occurred, including any error messages/stack traces}

## Environment / Context
- **Location:** {File/Module/Endpoint where error occurs}
- **Recent Changes:** {Any recent commits or changes related}

## Root Cause Analysis (Initial thoughts)
{Your assessment of why this might be happening, if known. e.g., "Null pointer due to missing API parameter"}
```

---

## 4. Document & Record the Bug

Depending on how the project tracks bugs, formally record it:

**Option A (As a Plan):**
If the user wants it tracked as an immediate or future task:
```bash
pm plan create --phase <phase-id> --title "Fix: {Bug Title}"
```
Then update the generated plan `.md` file with the formatted bug report content from Step 3.

**Option B (ROADMAP / State):**
If the bug requires scheduling for later:
- Add it to a Bug Tracking phase in `.gsd/ROADMAP.md` or as a phase TODO in `.gsd/STATE.md`.

---

## 5. Present to User and Offer Next Steps

Show the finalized report and ask how they want to proceed:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM CLI ► BUG REPORT FILED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The bug has been analyzed, formatted, and documented.

Title: {Title}
Location/Plan: {Where it was recorded}

───────────────────────────────────────────────────────

▶ NEXT

/pm-fix-bug   — To immediately start debugging and fixing this issue
/pm-plan-phase — To continue with regular planning or next steps
───────────────────────────────────────────────────────
```

</process>
