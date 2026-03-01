import type { AnyIngredient, TextOverlayIngredient, BrandKitIngredient } from '../types/ingredient';

/* ── Seed / Demo Ingredients ─────────────────────────────────────────── */

/**
 * Demo ingredients covering all 6 types, distributed across demo projects.
 * Pattern matches DEMO_PROJECTS in projectStore.ts (demo-1, demo-2, demo-3).
 */
export const DEMO_INGREDIENTS: AnyIngredient[] = [
    /* ── Subjects ── */
    {
        id: 'ing-sub-1',
        projectId: 'demo-1',
        type: 'subject',
        name: 'Golden Retriever Puppy',
        description: 'A fluffy golden retriever puppy sitting and looking at the camera',
        tags: ['animal', 'dog', 'cute', 'portrait'],
        createdAt: '2026-02-28T10:10:00.000Z',
        updatedAt: '2026-02-28T10:10:00.000Z',
    },
    {
        id: 'ing-sub-2',
        projectId: 'demo-1',
        type: 'subject',
        name: 'Crystal Vase',
        description: 'An elegant crystal vase with light refractions',
        tags: ['object', 'glass', 'elegant', 'still-life'],
        createdAt: '2026-02-28T10:15:00.000Z',
        updatedAt: '2026-02-28T10:15:00.000Z',
    },
    {
        id: 'ing-sub-3',
        projectId: 'demo-2',
        type: 'subject',
        name: 'Mountain Peak',
        description: 'A snow-capped mountain peak piercing through clouds',
        tags: ['nature', 'mountain', 'landscape', 'epic'],
        createdAt: '2026-02-27T14:30:00.000Z',
        updatedAt: '2026-02-27T14:30:00.000Z',
    },

    /* ── Scenes ── */
    {
        id: 'ing-scene-1',
        projectId: 'demo-2',
        type: 'scene',
        name: 'Sunset Beach',
        description: 'A serene beach at golden hour with warm orange and purple sky',
        tags: ['beach', 'sunset', 'warm', 'outdoor'],
        createdAt: '2026-02-27T14:35:00.000Z',
        updatedAt: '2026-02-27T14:35:00.000Z',
    },
    {
        id: 'ing-scene-2',
        projectId: 'demo-1',
        type: 'scene',
        name: 'Cozy Café Interior',
        description: 'A warm café interior with exposed brick, ambient lighting, and wooden tables',
        tags: ['interior', 'café', 'cozy', 'warm'],
        createdAt: '2026-02-28T10:20:00.000Z',
        updatedAt: '2026-02-28T10:20:00.000Z',
    },

    /* ── Styles ── */
    {
        id: 'ing-style-1',
        projectId: 'demo-1',
        type: 'style',
        name: 'Studio Ghibli Watercolor',
        description: 'Soft watercolor aesthetic inspired by Studio Ghibli films',
        tags: ['anime', 'watercolor', 'ghibli', 'soft'],
        createdAt: '2026-02-28T10:25:00.000Z',
        updatedAt: '2026-02-28T10:25:00.000Z',
    },
    {
        id: 'ing-style-2',
        projectId: 'demo-2',
        type: 'style',
        name: 'Cyberpunk Neon',
        description: 'Vibrant neon-lit cyberpunk aesthetic with deep shadows and electric colors',
        tags: ['cyberpunk', 'neon', 'futuristic', 'dark'],
        createdAt: '2026-02-27T14:40:00.000Z',
        updatedAt: '2026-02-27T14:40:00.000Z',
    },

    /* ── Text Overlay ── */
    {
        id: 'ing-text-1',
        projectId: 'demo-3',
        type: 'text-overlay',
        name: 'Brand Tagline',
        description: 'Company tagline for brand asset overlays',
        tags: ['text', 'brand', 'tagline'],
        text: 'Where Imagination Meets Pixel',
        fontFamily: 'Inter',
        fontSize: 48,
        color: '#FFFFFF',
        createdAt: '2026-02-25T08:30:00.000Z',
        updatedAt: '2026-02-25T08:30:00.000Z',
    } satisfies TextOverlayIngredient,

    /* ── Modifier ── */
    {
        id: 'ing-mod-1',
        projectId: 'demo-1',
        type: 'modifier',
        name: 'Shallow Depth of Field',
        description: 'Blurred background with sharp subject focus, f/1.4 bokeh effect',
        tags: ['bokeh', 'focus', 'dof', 'blur'],
        createdAt: '2026-02-28T10:30:00.000Z',
        updatedAt: '2026-02-28T10:30:00.000Z',
    },

    /* ── Brand Kit ── */
    {
        id: 'ing-bk-1',
        projectId: 'demo-3',
        type: 'brand-kit',
        name: 'Corporate Brand Kit',
        description: 'Consistent visual identity — combines Studio Ghibli style with shallow DoF',
        tags: ['brand', 'corporate', 'consistency'],
        styleIds: ['ing-style-1'],
        modifierIds: ['ing-mod-1'],
        createdAt: '2026-02-25T08:35:00.000Z',
        updatedAt: '2026-02-25T08:35:00.000Z',
    } satisfies BrandKitIngredient,
];
