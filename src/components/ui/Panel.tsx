import { type ReactNode, type HTMLAttributes } from 'react';
import './Panel.css';

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    border?: boolean;
    title?: string;
    children: ReactNode;
}

export function Panel({
    variant = 'default',
    padding = 'md',
    border = true,
    title,
    className = '',
    children,
    ...props
}: PanelProps) {
    const classes = [
        'panel',
        `panel--${variant}`,
        `panel--pad-${padding}`,
        border && 'panel--border',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classes} {...props}>
            {title && (
                <div className="panel__header">
                    <span className="panel__title">{title}</span>
                </div>
            )}
            <div className="panel__body">{children}</div>
        </div>
    );
}
