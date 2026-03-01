/* ── Storage Service ─────────────────────────────────────────────────── */
/* Thin abstraction over localStorage. Swap the backend (e.g. Electron    *
 * fs) without touching store code.                                       */

const PREFIX = 'iw:';

export interface StorageService {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
    listKeys: (prefix?: string) => string[];
}

function prefixed(key: string): string {
    return `${PREFIX}${key}`;
}

export const storage: StorageService = {
    getItem(key: string): string | null {
        try {
            return localStorage.getItem(prefixed(key));
        } catch {
            console.warn('[storage] getItem failed for', key);
            return null;
        }
    },

    setItem(key: string, value: string): void {
        try {
            localStorage.setItem(prefixed(key), value);
        } catch {
            console.warn('[storage] setItem failed for', key);
        }
    },

    removeItem(key: string): void {
        try {
            localStorage.removeItem(prefixed(key));
        } catch {
            console.warn('[storage] removeItem failed for', key);
        }
    },

    listKeys(prefix = ''): string[] {
        const fullPrefix = prefixed(prefix);
        const keys: string[] = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k?.startsWith(fullPrefix)) {
                    // Return unprefixed key
                    keys.push(k.slice(PREFIX.length));
                }
            }
        } catch {
            console.warn('[storage] listKeys failed');
        }
        return keys;
    },
};

/** Remove ALL app data from localStorage (dev/debug utility). */
export function clearAllData(): void {
    const keys = storage.listKeys();
    keys.forEach((k) => storage.removeItem(k));
}
