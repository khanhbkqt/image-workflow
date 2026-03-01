import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: ReactNode;
    loading?: boolean;
    fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            icon,
            loading = false,
            fullWidth = false,
            disabled,
            className = '',
            children,
            ...props
        },
        ref
    ) => {
        const classes = [
            'btn',
            `btn--${variant}`,
            `btn--${size}`,
            fullWidth && 'btn--full',
            loading && 'btn--loading',
            icon && !children && 'btn--icon-only',
            className,
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <button
                ref={ref}
                className={classes}
                disabled={disabled || loading}
                {...props}
            >
                {loading && <span className="btn__spinner" aria-hidden="true" />}
                <span className={`btn__content ${loading ? 'btn__content--hidden' : ''}`}>
                    {icon && <span className="btn__icon">{icon}</span>}
                    {children && <span className="btn__label">{children}</span>}
                </span>
            </button>
        );
    }
);

Button.displayName = 'Button';
