import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { Dialog, Button, Input } from '../ui';
import { useIngredientStore } from '../../stores/ingredientStore';
import {
    INGREDIENT_CATEGORIES,
    type Ingredient,
} from '../../types/ingredient';

/* ── Props ──────────────────────────────────────────────────────────── */
interface EditIngredientDialogProps {
    open: boolean;
    onClose: () => void;
    ingredient: Ingredient | null;
}

export function EditIngredientDialog({ open, onClose, ingredient }: EditIngredientDialogProps) {
    const updateIngredient = useIngredientStore((s) => s.updateIngredient);

    /* ── Form state ── */
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

    /* ── Pre-populate on open ── */
    useEffect(() => {
        if (open && ingredient) {
            setName(ingredient.name);
            setDescription(ingredient.description ?? '');
            setTags([...ingredient.tags]);
            setImageUrl(ingredient.imageUrl ?? '');
            setTagInput('');

            if (ingredient.type === 'text-overlay') {
                const typed = ingredient as Ingredient & {
                    text?: string;
                    fontFamily?: string;
                    fontSize?: number;
                    color?: string;
                };
                setText(typed.text ?? '');
                setFontFamily(typed.fontFamily ?? '');
                setFontSize(typed.fontSize ?? '');
                setColor(typed.color ?? '#ffffff');
            }
        }
    }, [open, ingredient]);

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

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
        if (!ingredient || !name.trim()) return;

        const updates: Partial<Ingredient> & Record<string, unknown> = {};

        if (name.trim() !== ingredient.name) updates.name = name.trim();
        if ((description.trim() || undefined) !== ingredient.description)
            updates.description = description.trim() || undefined;
        if (JSON.stringify(tags) !== JSON.stringify(ingredient.tags)) updates.tags = tags;
        if ((imageUrl || undefined) !== ingredient.imageUrl) updates.imageUrl = imageUrl || undefined;

        if (ingredient.type === 'text-overlay') {
            updates.text = text.trim();
            updates.fontFamily = fontFamily.trim() || undefined;
            updates.fontSize = fontSize ? Number(fontSize) : undefined;
            updates.color = color;
        }

        if (Object.keys(updates).length > 0) {
            updateIngredient(ingredient.id, updates as Partial<Ingredient>);
        }
        handleClose();
    };

    if (!ingredient) return null;

    const meta = INGREDIENT_CATEGORIES[ingredient.type];
    const isValid = name.trim() && (ingredient.type !== 'text-overlay' || text.trim());

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            title={`${meta.icon} Edit — ${ingredient.name}`}
            maxWidth={500}
            actions={
                <>
                    <Button variant="ghost" type="button" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={!isValid} onClick={handleSubmit}>
                        Save
                    </Button>
                </>
            }
        >
            <form className="create-ingredient-form" onSubmit={handleSubmit}>
                {/* Type (read-only) */}
                <div className="cid-field">
                    <label className="cid-label">Type</label>
                    <div className="cid-type-display">
                        {meta.icon} {meta.label}
                    </div>
                </div>

                {/* Name */}
                <Input
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="off"
                />

                {/* Description */}
                <div className="cid-field">
                    <label className="cid-label">Description (optional)</label>
                    <textarea
                        className="cid-textarea"
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
                    <label className="cid-label">Image</label>
                    <label className="cid-dropzone">
                        {imageUrl ? (
                            <img src={imageUrl} alt="Preview" className="cid-preview" />
                        ) : (
                            <span className="cid-dropzone__text">📷 Click to upload</span>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="cid-dropzone__input"
                        />
                    </label>
                </div>

                {/* ── Conditional: text-overlay ── */}
                {ingredient.type === 'text-overlay' && (
                    <div className="cid-conditional">
                        <div className="cid-conditional__label">Text Overlay Settings</div>
                        <Input
                            label="Text *"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <div className="cid-row">
                            <Input
                                label="Font Family"
                                value={fontFamily}
                                onChange={(e) => setFontFamily(e.target.value)}
                            />
                            <Input
                                label="Font Size"
                                type="number"
                                value={fontSize}
                                onChange={(e) =>
                                    setFontSize(e.target.value ? Number(e.target.value) : '')
                                }
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
            </form>
        </Dialog>
    );
}
