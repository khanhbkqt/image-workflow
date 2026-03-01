import { useState, useCallback, type FormEvent } from 'react';
import { Dialog, Button, Input, Select } from '../ui';
import { useIngredientStore } from '../../stores/ingredientStore';
import { useProjectStore } from '../../stores/projectStore';
import {
    INGREDIENT_TYPES,
    INGREDIENT_CATEGORIES,
    type IngredientType,
    type CreateIngredientInput,
} from '../../types/ingredient';
import './CreateIngredientDialog.css';

/* ── Type options for Select ───────────────────────────────────────── */
const TYPE_OPTIONS = INGREDIENT_TYPES.map((t) => ({
    value: t,
    label: INGREDIENT_CATEGORIES[t].label,
    icon: INGREDIENT_CATEGORIES[t].icon,
}));

/* ── Props ──────────────────────────────────────────────────────────── */
interface CreateIngredientDialogProps {
    open: boolean;
    onClose: () => void;
}

export function CreateIngredientDialog({ open, onClose }: CreateIngredientDialogProps) {
    const addIngredient = useIngredientStore((s) => s.addIngredient);
    const activeProjectId = useProjectStore((s) => s.activeProjectId);

    /* ── Form state ── */
    const [type, setType] = useState<IngredientType>('subject');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [imageUrl, setImageUrl] = useState('');

    /* Text-overlay fields */
    const [text, setText] = useState('');
    const [fontFamily, setFontFamily] = useState('');
    const [fontSize, setFontSize] = useState<number | ''>('');
    const [color, setColor] = useState('#ffffff');

    /* Brand-kit fields (simplified: comma-separated IDs) */
    const [styleIds, setStyleIds] = useState('');
    const [modifierIds, setModifierIds] = useState('');

    /* ── Reset form ── */
    const resetForm = useCallback(() => {
        setType('subject');
        setName('');
        setDescription('');
        setTagInput('');
        setTags([]);
        setImageUrl('');
        setText('');
        setFontFamily('');
        setFontSize('');
        setColor('#ffffff');
        setStyleIds('');
        setModifierIds('');
    }, []);

    const handleClose = () => {
        resetForm();
        onClose();
    };

    /* ── Tags ── */
    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim().replace(/,/g, '');
            if (newTag && !tags.includes(newTag)) {
                setTags((prev) => [...prev, newTag]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setTags((prev) => prev.filter((t) => t !== tag));
    };

    /* ── Image upload ── */
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    /* ── Submit ── */
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !activeProjectId) return;
        if (type === 'text-overlay' && !text.trim()) return;

        const base: CreateIngredientInput = {
            projectId: activeProjectId,
            type,
            name: name.trim(),
            description: description.trim() || undefined,
            tags,
            imageUrl: imageUrl || undefined,
        };

        // Extend with type-specific fields
        const input: Record<string, unknown> = { ...base };
        if (type === 'text-overlay') {
            input.text = text.trim();
            if (fontFamily.trim()) input.fontFamily = fontFamily.trim();
            if (fontSize) input.fontSize = Number(fontSize);
            input.color = color;
        }
        if (type === 'brand-kit') {
            input.styleIds = styleIds
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            input.modifierIds = modifierIds
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
        }

        addIngredient(input as CreateIngredientInput);
        handleClose();
    };

    const isValid = name.trim() && (type !== 'text-overlay' || text.trim());

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            title="New Ingredient"
            maxWidth={500}
            actions={
                <>
                    <Button variant="ghost" type="button" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={!isValid} onClick={handleSubmit}>
                        Create
                    </Button>
                </>
            }
        >
            <form className="create-ingredient-form" onSubmit={handleSubmit}>
                {/* Type selector */}
                <Select
                    label="Type"
                    options={TYPE_OPTIONS}
                    value={type}
                    onChange={(e) => setType(e.target.value as IngredientType)}
                />

                {/* Name */}
                <Input
                    label="Name"
                    placeholder="e.g. Golden Hour Portrait"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="off"
                />

                {/* Description */}
                <div className="cid-field">
                    <label className="cid-label">Description (optional)</label>
                    <textarea
                        className="cid-textarea"
                        placeholder="What does this ingredient do?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                    />
                </div>

                {/* Tags */}
                <div className="cid-field">
                    <label className="cid-label">Tags</label>
                    <Input
                        placeholder="Type and press Enter…"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        size="sm"
                    />
                    {tags.length > 0 && (
                        <div className="cid-tags">
                            {tags.map((tag) => (
                                <span key={tag} className="cid-tag">
                                    {tag}
                                    <button
                                        type="button"
                                        className="cid-tag__remove"
                                        onClick={() => removeTag(tag)}
                                        aria-label={`Remove ${tag}`}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Image upload */}
                <div className="cid-field">
                    <label className="cid-label">Image (optional)</label>
                    <label className="cid-dropzone">
                        {imageUrl ? (
                            <img src={imageUrl} alt="Preview" className="cid-preview" />
                        ) : (
                            <span className="cid-dropzone__text">
                                📷 Click to upload an image
                            </span>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="cid-dropzone__input"
                        />
                    </label>
                </div>

                {/* ── Conditional fields: text-overlay ── */}
                {type === 'text-overlay' && (
                    <div className="cid-conditional">
                        <div className="cid-conditional__label">Text Overlay Settings</div>
                        <Input
                            label="Text *"
                            placeholder="Text to display on image"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <div className="cid-row">
                            <Input
                                label="Font Family"
                                placeholder="e.g. Inter"
                                value={fontFamily}
                                onChange={(e) => setFontFamily(e.target.value)}
                            />
                            <Input
                                label="Font Size"
                                type="number"
                                placeholder="24"
                                value={fontSize}
                                onChange={(e) => setFontSize(e.target.value ? Number(e.target.value) : '')}
                            />
                        </div>
                        <div className="cid-field">
                            <label className="cid-label">Color</label>
                            <div className="cid-color-picker">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="cid-color-input"
                                />
                                <span className="cid-color-value">{color}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Conditional fields: brand-kit ── */}
                {type === 'brand-kit' && (
                    <div className="cid-conditional">
                        <div className="cid-conditional__label">Brand Kit References</div>
                        <Input
                            label="Style IDs (comma-separated)"
                            placeholder="style_1, style_2"
                            value={styleIds}
                            onChange={(e) => setStyleIds(e.target.value)}
                        />
                        <Input
                            label="Modifier IDs (comma-separated)"
                            placeholder="mod_1, mod_2"
                            value={modifierIds}
                            onChange={(e) => setModifierIds(e.target.value)}
                        />
                    </div>
                )}
            </form>
        </Dialog>
    );
}
