import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './Dialog.css';

export interface DialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    danger?: boolean;
    children: ReactNode;
    actions?: ReactNode;
    /** Optional max-width override (default: 440px) */
    maxWidth?: number;
}

export function Dialog({ open, onClose, title, danger, children, actions, maxWidth }: DialogProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    /* Auto-focus first focusable element on open */
    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(() => {
            const focusable = cardRef.current?.querySelector<HTMLElement>(
                'input, select, textarea, button:not([disabled])'
            );
            focusable?.focus();
        }, 50);
        return () => clearTimeout(timer);
    }, [open]);

    /* Lock body scroll while open */
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    if (!open) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    };

    const cardClasses = ['dialog-card', danger && 'dialog-card--danger']
        .filter(Boolean)
        .join(' ');

    return createPortal(
        <div className="dialog-overlay" onClick={handleOverlayClick} onKeyDown={handleKeyDown}>
            <div
                ref={cardRef}
                className={cardClasses}
                role={danger ? 'alertdialog' : 'dialog'}
                aria-labelledby="dialog-title"
                style={maxWidth ? { maxWidth } : undefined}
            >
                <h2 className="dialog-card__title" id="dialog-title">
                    {title}
                </h2>
                <div className="dialog-body">{children}</div>
                {actions && <div className="dialog-actions">{actions}</div>}
            </div>
        </div>,
        document.body
    );
}
