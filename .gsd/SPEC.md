Status: FINALIZED

# Image Workflow — Specification

A macOS desktop app for visual, composable AI image generation. Build workflows from reusable ingredients on an infinite canvas to produce images at scale with brand consistency.

## Goal

Replace the linear prompt-type-generate loop with a **visual node-based workflow system** that makes AI image generation:
- **Fast** — batch generation from reusable workflows
- **Consistent** — brand kits lock in visual identity
- **Composable** — ingredients snap together like building blocks
- **Cumulative** — libraries and recipes grow more valuable over time

## Scope

### Core Features

#### 1. Projects
- Workspace that groups canvases, ingredients, and generated images
- Dashboard to create, open, rename, and delete projects
- Each project has its own local folder on disk

#### 2. Infinite Canvas
- Pan, zoom, and navigate freely
- Drag ingredient nodes from sidebar library
- Wire nodes together to define data flow
- Visual preview of generated images directly on canvas
- Save/load canvas state (per project)

#### 3. Ingredient System
- **Types:** Subject, Scene, Style, Text Overlay, Modifier, Brand Kit
- Create ingredients by: uploading images, typing descriptions, or **AI generation**
- Ingredients are reusable across canvases within a project
- Tag, search, and filter ingredients

#### 4. Node-Based Workflow Engine
| Node | Purpose |
|------|---------|
| **Ingredient** | Holds a reusable building block |
| **Generate** | Sends ingredients to AI → returns image(s) |
| **Generate Ingredient** | AI-creates a new ingredient from text/image |
| **Batch Generator** | Generates all combinations from input lists |
| **Style Fan-Out** | Branches one input across multiple styles |
| **Compose** | Merges ingredients into a combined prompt |
| **Preview** | Shows image inline on canvas |
| **Output** | Marks result for export |
| **Brand Kit** | Bundles style + modifiers for consistency |

#### 5. Generation Engine
- Backend: reverse-engineered Google Labs APIs (ImageFX, Whisk, Flow)
- Auth via Google Labs browser cookies
- Support for:
  - Text-to-image (ImageFX / Imagen)
  - Image-based ingredient inputs — subject, scene, style (Whisk)
  - Style transfer and refinement (Flow)
- Multiple variations per generation
- Generation queue with status tracking

#### 6. Ingredient Library
- Sidebar panel with categories (Subject, Scene, Style, etc.)
- Create, browse, tag, search, filter
- Drag-and-drop onto canvas
- Persistent across sessions (local storage per project)

#### 7. Recipes (Saved Workflows)
- Save a canvas workflow as a named recipe
- Load recipes to pre-populate canvas
- Clone and modify recipes
- Recipes stored locally per project

#### 8. Export
- Download individual images or batch as ZIP
- Output formats: PNG, JPG, WebP
- Organized by project folder structure

#### 9. MCP Server (AI Agent Copilot)
- Local MCP server exposed by the desktop app
- AI clients (Antigravity, Cursor, Claude Code, Gemini CLI, Codex, etc.) connect to it
- **Scope: prompt drafting & optimization only** — user retains full UI control
- MCP tools:
  - **Optimize prompt** — rewrite casual descriptions into high-quality Imagen prompts
  - **Suggest prompts** — given a project's brand kit / ingredients, suggest prompts that fit
  - **Build workflow draft** — given a natural language description, suggest a node graph configuration (user reviews & applies in UI)
  - **List ingredients** — read the project's ingredient library for context
  - **List projects** — browse available projects
- User always reviews AI suggestions in the desktop UI before generating

## Non-Goals (v1)

- ❌ Video generation
- ❌ Real-time collaboration
- ❌ Web deployment (desktop only)
- ❌ Custom model training / fine-tuning
- ❌ Image editing (cropping, retouching, inpainting)
- ❌ Self-hosted AI models
- ❌ Cross-platform (macOS only)
- ❌ Sharing / multi-user features

## Technical Architecture

| Layer | Technology |
|-------|------------|
| Desktop shell | Electron or Tauri (macOS) |
| Frontend | React + TypeScript + Vite |
| Canvas | React Flow or custom canvas engine |
| State | Zustand |
| Persistence | Local filesystem (JSON + images) |
| AI Backend | Google Labs APIs (ImageFX, Whisk, Flow) via cookies |
| MCP Server | Local stdio/SSE server for AI agent integration |

### Data Model
```
~/ImageWorkflow/
  └── projects/
       └── summer-campaign/
            ├── project.json          # metadata
            ├── ingredients/
            │   ├── subjects/         # uploaded/generated images + metadata
            │   ├── scenes/
            │   ├── styles/
            │   └── brand-kits/
            ├── canvases/
            │   └── canvas-001.json   # node graph + positions
            ├── recipes/
            │   └── product-shot.json # saved workflow template
            └── output/
                └── generated images
```

## Primary User Flows

### Quick Generate
```
Open project → Drag Subject + Style onto canvas → Wire to Generate → Hit Generate → Preview → Export
```

### Brand Batch
```
Open project → Load Brand Kit → Add list of Subjects → Wire to Batch Generator → Generate All → Review grid → Export ZIP
```

### Style Exploration
```
One Subject → Style Fan-Out to 5 styles → Generate all → Compare on canvas → Pick winner → Save style to library
```

### Ingredient Generation
```
Add "Generate Ingredient" node → Describe scene → AI generates Scene image → Wire into workflow → Generate final composite
```
