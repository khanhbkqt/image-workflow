import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import './Input.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    icon?: ReactNode;
    error?: string;
    size?: 'sm' | 'md';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, icon, error, size = 'md', className = '', id, ...props }, ref) => {
        const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

        const wrapperClasses = [
            'input-wrapper',
            `input-wrapper--${size}`,
            error && 'input-wrapper--error',
            icon && 'input-wrapper--has-icon',
            className,
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <div className={wrapperClasses}>
                {label && (
                    <label className="input-label" htmlFor={inputId}>
                        {label}
                    </label>
                )}
                <div className="input-field">
                    {icon && <span className="input-icon">{icon}</span>}
                    <input ref={ref} id={inputId} className="input-control" {...props} />
                </div>
                {error && <span className="input-error">{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';
