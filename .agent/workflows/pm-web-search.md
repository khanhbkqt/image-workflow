---
description: Search the web for information to inform decisions
---

# Web Search Workflow

Search the web to gather information for technical decisions, API documentation, library comparisons, or any research need.

## When to Use

- Evaluating libraries or frameworks
- Finding API documentation
- Checking current best practices
- Researching error messages
- Comparing implementation approaches

---

## Step 1: Formulate Query

Parse the request into a focused search query.

**Good queries:**
- Specific: "Next.js 14 app router authentication best practices"
- Targeted: "Prisma vs Drizzle ORM comparison 2024"
- Actionable: "how to fix CORS error Express.js"

**Bad queries:**
- Too broad: "how to code"
- Too vague: "best database"

---

## Step 2: Execute Search

Use your AI client's web search tool with:
- **Query:** The formulated search query
- **Domain** (optional): Prioritize a specific site (e.g., `docs.python.org`)

---

## Step 3: Analyze Results

From the search results:
1. Extract key information relevant to the need
2. Note sources for citations
3. Identify patterns across multiple results
4. Flag contradictions or outdated information

---

## Step 4: Record Findings

If the findings are project-relevant, record them:

```bash
pm context set "research-<topic>" \
  "<key findings and recommendation>" \
  --category decision
```

---

## Step 5: Act on Findings

Based on results:
- Suggest follow-up searches if needed
- Recommend adding to phase research notes
- Offer to implement based on findings

## Integration with PM Workflows

| Workflow | How web-search helps |
|----------|---------------------|
| [Research Phase](pm-research-phase.md) | Gather information for phase research |
| [Plan Phase](pm-plan-phase.md) | Evaluate technology options during planning |
| [Debug](pm-debug.md) | Find solutions to error messages |

## Success Criteria

- [ ] Relevant information found and summarized
- [ ] Sources cited
- [ ] Actionable recommendation provided
- [ ] Findings recorded if project-relevant
