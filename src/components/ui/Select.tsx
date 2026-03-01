import { forwardRef, type SelectHTMLAttributes } from 'react';
import './Select.css';

export interface SelectOption {
    value: string;
    label: string;
    icon?: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    label?: string;
    options: SelectOption[];
    size?: 'sm' | 'md';
    placeholder?: string;
    error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, options, size = 'md', placeholder, error, className = '', id, ...props }, ref) => {
        const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

        const wrapperClasses = [
            'select-wrapper',
            `select-wrapper--${size}`,
            error && 'select-wrapper--error',
            className,
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <div className={wrapperClasses}>
                {label && (
                    <label className="select-label" htmlFor={selectId}>
                        {label}
                    </label>
                )}
                <div className="select-field">
                    <select ref={ref} id={selectId} className="select-control" {...props}>
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.icon ? `${opt.icon} ${opt.label}` : opt.label}
                            </option>
                        ))}
                    </select>
                    <span className="select-arrow" aria-hidden="true">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                                d="M2.5 4.5L6 8L9.5 4.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>
                </div>
                {error && <span className="select-error">{error}</span>}
            </div>
        );
    }
);

Select.displayName = 'Select';
