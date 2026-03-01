import { Dialog, Button } from '../ui';
import { useIngredientStore } from '../../stores/ingredientStore';
import { INGREDIENT_CATEGORIES, type Ingredient } from '../../types/ingredient';

interface DeleteIngredientDialogProps {
    open: boolean;
    onClose: () => void;
    ingredient: Ingredient | null;
}

export function DeleteIngredientDialog({ open, onClose, ingredient }: DeleteIngredientDialogProps) {
    const deleteIngredient = useIngredientStore((s) => s.deleteIngredient);

    if (!ingredient) return null;

    const meta = INGREDIENT_CATEGORIES[ingredient.type];

    const handleDelete = () => {
        deleteIngredient(ingredient.id);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title="Delete Ingredient"
            danger
            actions={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </>
            }
        >
            <div className="dialog-warning">
                Are you sure you want to delete <strong>{meta.icon} {ingredient.name}</strong>?
                This action cannot be undone.
            </div>
            {ingredient.imageUrl && (
                <img
                    src={ingredient.imageUrl}
                    alt={ingredient.name}
                    style={{
                        maxWidth: '100%',
                        maxHeight: 100,
                        borderRadius: 'var(--radius-md)',
                        objectFit: 'contain',
                        opacity: 0.6,
                    }}
                />
            )}
        </Dialog>
    );
}
