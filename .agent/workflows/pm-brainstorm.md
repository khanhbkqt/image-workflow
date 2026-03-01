---
description: Brainstorm, clarify requirements, and bootstrap project documentation
---

# Brainstorm Workflow

Guide the user through an interactive ideation process to clarify core requirements, establish user flows, define use cases, and bootstrap project documentation.

**CRITICAL RULE: The goal of this phase is PURE IDEATION and CLARIFICATION. Absolutely NO CODE should be written or generated during this workflow.**

## When to Use

When a user has a new idea for a project or milestone but the requirements are vague or incomplete. This workflow bridges the gap between a raw idea and a ready-to-plan `SPEC.md`.

## Prerequisites

- Project initialized (`pm init` has been run)

---

## Step 1: The Interactive Ideation Interview

Act as _The Architect_ and ask the user a series of clarifying questions to shape the idea into concrete use cases.
**Crucial Rule:** Ask **ONE question at a time**. Prioritize Multi-Choice Questions (A/B/C/D) to minimize user effort.

Focus the ideation on:

1. **Target User Persona:** Who is this for?
2. **Core Problem/Goal:** What needs to be solved?
3. **Primary Use Cases:** What are the top 3 things a user will do?
4. **Key User Flows:** How does a user accomplish the primary use cases step-by-step?
5. **Technical Constraints:** Any non-negotiable tech stack or platform requirements?
6. **Non-Goals:** What is out of scope for this project?

_Do not proceed to the next question until the user answers the current one._

---

## Step 2: Document Research & Ideas

**Do not clutter the `pm` database with raw brainstorming data.**
Store detailed research, mapped user journeys, use cases, alternative options considered, and deep architectural decisions in Markdown files for easy reading.

Create or update files such as:

- `.gsd/IDEATION.md` or `.gsd/RESEARCH.md` (for raw notes, personas, and use cases)
- `docs/decisions/0001-chosen-tech-stack.md` (for specific, finalized architectural records)

---

## Step 3: Record Final Decisions & References in DB

To interact with the project database, you must first register yourself if you haven't already:

```bash
pm agent register architect --role architect --type ai
```

Once a decision is finalized, use `pm-cli` to store the high-level decision and a **reference** to the relevant Markdown document. This allows other agents to discover _where_ to read the full context.

```bash
# Store a pointer to the ideation document
pm context set "ref:ideation-flows" "file:.gsd/IDEATION.md" --category note --agent architect

# Store the final high-level decision
pm context set "decision:target-platform" "Web Application" --category decision --agent architect

# Store a pointer to the architectural decision record (ADR)
pm context set "ref:adr-auth" "file:docs/decisions/0001-auth-strategy.md" --category note --agent architect
```

---

## Step 4: Draft the SPEC.md

Using the clarified requirements and recorded decisions, generate the first draft of the `.gsd/SPEC.md`. **Do not write any implementation code.**

Ensure the draft adheres to GSD principles:

- Clearly define the Goal and Scope.
- Define Non-Goals (Out of scope).
- Detail the Core Features and User Flows.

Include the following status block at the top of the file:

```markdown
Status: DRAFT
```

---

## Step 5: Ask User to Finalize

Present the drafted `SPEC.md` to the user and ask them to review it.

Remind the user of the golden rule of GSD:

> "No implementation code until SPEC.md contains 'Status: FINALIZED'."

Tell the user to manually change the status to `FINALIZED` when they are satisfied.

---

## Success Criteria

- [ ] Interactive interview completed without overwhelming the user (one question at a time).
- [ ] Brainstorming, user flows, and use cases stored in Markdown files (e.g., `.gsd/IDEATION.md`).
- [ ] Final decisions and file references saved to the database via `pm context set`.
- [ ] `.gsd/SPEC.md` drafted.
- [ ] **Zero implementation code written.**
- [ ] User instructed to review and change status to `FINALIZED`.

## Next Steps

If creating a new project:
→ [New Project](pm-new-project.md) — to set up the initial Milestone and Phases after the Spec is finalized.

If in an existing project:
→ [New Milestone](pm-new-milestone.md) — to group the new features into a deliverable.
