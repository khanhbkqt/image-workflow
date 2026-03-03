/* ── Settings Dialog ─────────────────────────────────────────────────── */

import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import './SettingsDialog.css';

export function SettingsDialog() {
    const authState = useAuthStore((s) => s.authState);
    const isOpen = useAuthStore((s) => s.isSettingsOpen);
    const closeSettings = useAuthStore((s) => s.closeSettings);
    const validateCookie = useAuthStore((s) => s.validateCookie);
    const clearAuth = useAuthStore((s) => s.clearAuth);

    const [cookie, setCookie] = useState('');

    if (!isOpen) return null;

    /**
     * Accepts either a plain cookie header string ("k=v; k2=v2")
     * or a JSON export from extensions like EditThisCookie / Cookie-Editor.
     * Both formats { cookies: [...] } and a bare array [...] are handled.
     */
    const parseCookieInput = (raw: string): string => {
        const trimmed = raw.trim();
        // Try to parse as JSON
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmed);
                // Handle { url: "...", cookies: [...] } format
                const list: Array<{ name: string; value: string }> =
                    Array.isArray(parsed) ? parsed : (parsed.cookies ?? []);
                if (list.length > 0 && list[0].name !== undefined) {
                    return list.map((c) => `${c.name}=${c.value}`).join('; ');
                }
            } catch {
                // Not valid JSON — fall through
            }
        }
        return trimmed;
    };

    const handleValidate = async () => {
        if (!cookie.trim()) return;
        await validateCookie(parseCookieInput(cookie));
    };

    const handleClear = () => {
        setCookie('');
        clearAuth();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') closeSettings();
    };

    const statusIcon =
        authState.status === 'valid' ? '✅' :
            authState.status === 'validating' ? '⏳' :
                authState.status === 'invalid' || authState.status === 'expired' ? '❌' :
                    '⚪';

    const statusLabel =
        authState.status === 'valid' ? 'Connected' :
            authState.status === 'validating' ? 'Validating…' :
                authState.status === 'invalid' ? 'Invalid' :
                    authState.status === 'expired' ? 'Expired' :
                        'Not configured';

    return (
        <div className="settings-overlay" onClick={closeSettings} onKeyDown={handleKeyDown}>
            <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="settings-dialog__header">
                    <h2 className="settings-dialog__title">
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
                            <circle cx="8" cy="8" r="3" />
                            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
                        </svg>
                        API Settings
                    </h2>
                    <button className="settings-dialog__close" onClick={closeSettings} aria-label="Close">
                        ✕
                    </button>
                </div>

                {/* Status Badge */}
                <div className={`settings-dialog__status settings-dialog__status--${authState.status}`}>
                    <span className="settings-dialog__status-icon">{statusIcon}</span>
                    <span className="settings-dialog__status-label">{statusLabel}</span>
                    {authState.status === 'valid' && authState.user && (
                        <span className="settings-dialog__user-info">
                            {authState.user.name} ({authState.user.email})
                        </span>
                    )}
                </div>

                {/* Cookie Input */}
                <div className="settings-dialog__field">
                    <label className="settings-dialog__label">Google Cookie</label>
                    <textarea
                        className="settings-dialog__textarea"
                        value={cookie}
                        onChange={(e) => setCookie(e.target.value)}
                        placeholder="Paste your Google Labs cookie here… (JSON export or raw cookie string)"
                        rows={4}
                        spellCheck={false}
                        autoComplete="off"
                    />
                    <p className="settings-dialog__hint">
                        Go to <strong>labs.google</strong> → DevTools → Application → Cookies → Copy all cookie values as a header string.<br />
                        Or paste a <strong>JSON export</strong> from a cookie extension (EditThisCookie, Cookie-Editor, etc.) — it will be parsed automatically.
                    </p>
                </div>

                {/* Error Message */}
                {authState.error && (
                    <div className="settings-dialog__error">
                        {authState.error}
                    </div>
                )}

                {/* Actions */}
                <div className="settings-dialog__actions">
                    <button
                        className="settings-dialog__btn settings-dialog__btn--validate"
                        onClick={handleValidate}
                        disabled={!cookie.trim() || authState.status === 'validating'}
                    >
                        {authState.status === 'validating' ? 'Validating…' : 'Validate & Save'}
                    </button>
                    {authState.status === 'valid' && (
                        <button
                            className="settings-dialog__btn settings-dialog__btn--clear"
                            onClick={handleClear}
                        >
                            Clear Auth
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
