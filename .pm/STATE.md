# Image Workflow — Current State

**Last updated:** 2026-03-02T20:26:00+07:00

---

## Active Milestone

**v2.0 — Prompt Flow Engine** (`active`)

Radically simplify to 2 node types: Ingredient (source image) and Prompt (text + image params → generated image shown inline, chainable). Remove ALL other nodes.

### Phase Status

| # | Phase | Status |
|---|-------|--------|
| 1 | Node Cleanup | ✅ completed |
| 2 | Prompt Node | ✅ completed |
| 3 | Flow Validation | ✅ completed |

### Current Position

All 3 phases of v2.0 are **completed**. The milestone is ready to be closed/completed.

---

## What Was Done (Last Session)

- Completed v2.0 Prompt Flow Engine milestone:
  - **Phase 1 — Node Cleanup:** Removed specialized nodes (BatchGenerator, StyleFanOut, GenericNode, Compose, Preview, Output). Simplified to Ingredient + Prompt nodes only.
  - **Phase 2 — Prompt Node:** Implemented the Prompt node with text input, image parameter support, and inline preview capability.
  - **Phase 3 — Flow Validation:** Validated node connections between Ingredient → Prompt, ensured edge rendering and handle interactivity.
- Fixed node connection logic (handle IDs, port types, CONNECTION_COMPATIBILITY rules).
- Fixed edge stroke color visibility on the canvas.
- Cleared stale canvas state from localStorage.

---

## Next Steps

1. **Complete v2.0 milestone** — Run `pm milestone update v2.0-prompt-flow --status completed`
2. **Decide next milestone** — Options:
   - **v1.3 AI Generation Engine** — Wire up actual AI generation (Google Labs APIs)
   - **v1.4 Export & MCP Server** — Add export and AI agent integration
3. **Activate and plan next milestone** — Create phases and plans for the chosen milestone

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop shell | Electron |
| Frontend | React + TypeScript + Vite |
| Canvas | React Flow |
| State | Zustand |
| Persistence | Local filesystem (JSON + localStorage) |
| AI Backend | Google Labs APIs (planned) |

## Source Structure

```
src/
├── App.tsx                    # Main application
├── components/
│   ├── canvas/                # Canvas + React Flow nodes
│   ├── dashboard/             # Project dashboard
│   ├── ingredients/           # Ingredient CRUD & library
│   ├── recipes/               # Recipe management
│   └── ui/                    # Shared UI components
├── hooks/                     # Custom React hooks
├── services/                  # Service layer
├── stores/                    # Zustand stores
├── styles/                    # Design system tokens
├── types/                     # TypeScript type definitions
└── utils/                     # Utility functions
```
