/**
 * Design System Tokens — TypeScript access to CSS custom properties.
 * Use these for inline styles, Zustand stores, or computed values.
 */

export const tokens = {
    /* ── Surface Layers ── */
    surface0: 'var(--surface-0)',
    surface1: 'var(--surface-1)',
    surface2: 'var(--surface-2)',
    surface3: 'var(--surface-3)',
    surface4: 'var(--surface-4)',

    /* ── Text ── */
    textPrimary: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    textMuted: 'var(--text-muted)',
    textInverse: 'var(--text-inverse)',

    /* ── Accent ── */
    accent: 'var(--accent)',
    accentHover: 'var(--accent-hover)',
    accentSubtle: 'var(--accent-subtle)',
    accentMuted: 'var(--accent-muted)',

    /* ── Semantic ── */
    success: 'var(--success)',
    successSubtle: 'var(--success-subtle)',
    warning: 'var(--warning)',
    warningSubtle: 'var(--warning-subtle)',
    error: 'var(--error)',
    errorSubtle: 'var(--error-subtle)',
    info: 'var(--info)',
    infoSubtle: 'var(--info-subtle)',

    /* ── Borders ── */
    borderSubtle: 'var(--border-subtle)',
    borderDefault: 'var(--border-default)',
    borderStrong: 'var(--border-strong)',

    /* ── Overlays ── */
    overlayLight: 'var(--overlay-light)',
    overlayDark: 'var(--overlay-dark)',

    /* ── Spacing ── */
    space1: 'var(--space-1)',
    space2: 'var(--space-2)',
    space3: 'var(--space-3)',
    space4: 'var(--space-4)',
    space5: 'var(--space-5)',
    space6: 'var(--space-6)',
    space7: 'var(--space-7)',
    space8: 'var(--space-8)',
    space9: 'var(--space-9)',
    space10: 'var(--space-10)',

    /* ── Radii ── */
    radiusSm: 'var(--radius-sm)',
    radiusMd: 'var(--radius-md)',
    radiusLg: 'var(--radius-lg)',
    radiusXl: 'var(--radius-xl)',
    radiusFull: 'var(--radius-full)',

    /* ── Shadows ── */
    shadowSm: 'var(--shadow-sm)',
    shadowMd: 'var(--shadow-md)',
    shadowLg: 'var(--shadow-lg)',
    shadowGlow: 'var(--shadow-glow)',

    /* ── Z-Index ── */
    zBase: 'var(--z-base)',
    zDropdown: 'var(--z-dropdown)',
    zModal: 'var(--z-modal)',
    zOverlay: 'var(--z-overlay)',
    zToast: 'var(--z-toast)',

    /* ── Transitions ── */
    easeDefault: 'var(--ease-default)',
    easeBounce: 'var(--ease-bounce)',
    durationFast: 'var(--duration-fast)',
    durationNormal: 'var(--duration-normal)',
    durationSlow: 'var(--duration-slow)',

    /* ── Typography ── */
    fontDisplay: 'var(--font-display)',
    fontBody: 'var(--font-body)',
    fontMono: 'var(--font-mono)',

    /* ── Type Scale ── */
    textXs: 'var(--text-xs)',
    textSm: 'var(--text-sm)',
    textBase: 'var(--text-base)',
    textMd: 'var(--text-md)',
    textLg: 'var(--text-lg)',
    textXl: 'var(--text-xl)',
    text2xl: 'var(--text-2xl)',
    text3xl: 'var(--text-3xl)',
    text4xl: 'var(--text-4xl)',
} as const;

export type TokenKey = keyof typeof tokens;
