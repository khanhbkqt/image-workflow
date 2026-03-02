# Image Workflow — Roadmap

A macOS desktop app for visual, composable AI image generation. Build workflows from reusable ingredients on an infinite canvas to produce images at scale with brand consistency.

---

## Milestones

### ✅ v1.0 — Canvas & App Shell `archived`

> Scaffold the Electron app with React+TS+Vite, build the infinite canvas with React Flow, sidebar layout, project CRUD, and local persistence.

| # | Phase | Status |
|---|-------|--------|
| 1 | Project Scaffold | ✅ completed |
| 2 | Design System | ✅ completed |
| 3 | Infinite Canvas | ✅ completed |
| 4 | Project Management | ✅ completed |
| 5 | Persistence Layer | ✅ completed |

**Completed:** 2026-03-01

---

### ✅ v1.1 — Ingredient System `archived`

> Build the ingredient data model, library sidebar, CRUD operations, drag-and-drop to canvas, and Brand Kit support.

| # | Phase | Status |
|---|-------|--------|
| 1 | Ingredient Data Model | ✅ completed |
| 2 | Ingredient CRUD | ✅ completed |
| 3 | Library Sidebar | ✅ completed |
| 4 | Drag & Drop | ✅ completed |
| 5 | Brand Kit | ✅ completed |

**Completed:** 2026-03-01

---

### ✅ v1.2 — Node-Based Workflows `completed`

> Implement the node graph engine with wiring, core nodes, advanced nodes, recipe save/load, sidebar polish, and visual overhaul.

| # | Phase | Status |
|---|-------|--------|
| 1 | Node Framework | ✅ completed |
| 2 | Core Nodes | ✅ completed |
| 3 | Advanced Nodes | ✅ completed |
| 4 | Recipes | ✅ completed |
| 5 | Sidebar Polish | ✅ completed |
| 6 | Gap Closure | ✅ completed |
| 7 | Node Visual Overhaul | ✅ completed |
| 8 | Node Connection Fix | ✅ completed |

**Completed:** 2026-03-02

---

### ✅ v2.0 — Prompt Flow Engine `completed`

> Radically simplify to 2 node types: Ingredient (source image) and Prompt (text + image params → generated image shown inline, chainable). Remove ALL other nodes.

| # | Phase | Status |
|---|-------|--------|
| 1 | Node Cleanup | ✅ completed |
| 2 | Prompt Node | ✅ completed |
| 3 | Flow Validation | ✅ completed |

**Completed:** 2026-03-02

---

### 🔵 v1.3 — AI Generation Engine `active` ← CURRENT

> Integrate Google Labs APIs (ImageFX, Whisk, Flow) for text-to-image and image-based generation with queue management.

| # | Phase | Plans | Status |
|---|-------|-------|--------|
| 1 | API Integration | 3 plans (2 waves) | ✅ completed |
| 2 | Generate Node | — | ⬚ not_started |
| 3 | Image-Based Generation | — | ⬚ not_started |
| 4 | Generation Queue | — | ⬚ not_started |
| 5 | Generate Ingredient Node | — | ⬚ not_started |

---

### 📋 v1.4 — Export & MCP Server `planned`

> Add export functionality (PNG/JPG/WebP, batch ZIP), MCP server for AI agent integration, onboarding UX, and final testing hardening.

| # | Phase | Status |
|---|-------|--------|
| 1 | Export System | ⬚ not_started |
| 2 | MCP Server | ⬚ not_started |
| 3 | Onboarding & UX | ⬚ not_started |
| 4 | Testing & Hardening | ⬚ not_started |

---

## Progress Summary

| Milestone | Status | Phases |
|-----------|--------|--------|
| v1.0 Canvas & App Shell | ✅ archived | 5/5 |
| v1.1 Ingredient System | ✅ archived | 5/5 |
| v1.2 Node-Based Workflows | ✅ completed | 8/8 |
| v2.0 Prompt Flow Engine | ✅ completed | 3/3 |
| v1.3 AI Generation Engine | 🔵 active | 1/5 |
| v1.4 Export & MCP Server | 📋 planned | 0/4 |
