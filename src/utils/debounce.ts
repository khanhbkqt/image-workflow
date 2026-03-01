/* ── Debounce Utility ────────────────────────────────────────────────── */

/**
 * Returns a debounced version of `fn` that waits `ms` before executing.
 * Trailing call only — intermediate calls within the delay are discarded.
 */
export function debounce<T extends (...args: unknown[]) => void>(
    fn: T,
    ms: number,
): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout> | undefined;

    return (...args: Parameters<T>) => {
        if (timer !== undefined) clearTimeout(timer);
        timer = setTimeout(() => {
            timer = undefined;
            fn(...args);
        }, ms);
    };
}
