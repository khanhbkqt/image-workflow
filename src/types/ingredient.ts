/* ── Ingredient Types ────────────────────────────────────────────────── */

/** The six core ingredient types in the system. */
export type IngredientType =
    | 'subject'
    | 'scene'
    | 'style'
    | 'text-overlay'
    | 'modifier'
    | 'brand-kit';

/* ── Base Ingredient ────────────────────────────────────────────────── */

/** Base interface shared by all ingredients. */
export interface Ingredient {
    id: string;
    projectId: string;
    type: IngredientType;
    name: string;
    description?: string;
    tags: string[];
    imageUrl?: string; // base64 data URL or blob URL for uploaded images
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
}

/* ── Type-Specific Data ─────────────────────────────────────────────── */

/** Text Overlay ingredient — adds typographic fields. */
export interface TextOverlayIngredient extends Ingredient {
    type: 'text-overlay';
    text: string;
    fontFamily?: string;
    fontSize?: number;
    color?: string;
}

/** Brand Kit ingredient — references styles + modifiers for consistency. */
export interface BrandKitIngredient extends Ingredient {
    type: 'brand-kit';
    styleIds: string[];    // references to Style ingredients
    modifierIds: string[]; // references to Modifier ingredients
}

/** Union of all ingredient variants for type narrowing. */
export type AnyIngredient = Ingredient | TextOverlayIngredient | BrandKitIngredient;

/* ── Category Metadata ──────────────────────────────────────────────── */

export interface IngredientCategoryMeta {
    label: string;
    icon: string;
    description: string;
}

/** Metadata for each ingredient type — used for UI grouping. */
export const INGREDIENT_CATEGORIES: Record<IngredientType, IngredientCategoryMeta> = {
    subject: { label: 'Subject', icon: '🎯', description: 'The main subject of the image' },
    scene: { label: 'Scene', icon: '🏞️', description: 'Background or environment' },
    style: { label: 'Style', icon: '🎨', description: 'Visual style or art direction' },
    'text-overlay': { label: 'Text Overlay', icon: '✏️', description: 'Text to render on the image' },
    modifier: { label: 'Modifier', icon: '⚙️', description: 'Adjustments like depth of field, lighting' },
    'brand-kit': { label: 'Brand Kit', icon: '💼', description: 'Bundled style + modifiers for consistency' },
};

/** All ingredient types as an ordered array (for iteration). */
export const INGREDIENT_TYPES: IngredientType[] = [
    'subject',
    'scene',
    'style',
    'text-overlay',
    'modifier',
    'brand-kit',
];

/* ── Input types (for store actions) ────────────────────────────────── */

/** Input for creating a new ingredient (auto-generated fields omitted). */
export type CreateIngredientInput = Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>;
