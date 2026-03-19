import { useCallback, useMemo, useState, useRef } from 'react';

export default function useToast() {
    const [toasts, setToasts] = useState([]);
    const recentMessages = useRef(new Set());

    const push = useCallback((toast) => {
        const message = toast?.message ?? '';
        
        // Prevent duplicate messages within 3 seconds
        if (recentMessages.current.has(message)) {
            return;
        }
        recentMessages.current.add(message);
        setTimeout(() => recentMessages.current.delete(message), 3000);

        const id = crypto.randomUUID?.() ?? String(Date.now());
        const next = {
            id,
            type: toast?.type ?? 'info',
            title: toast?.title ?? '',
            message,
            timeoutMs: toast?.timeoutMs ?? 3000,
        };

        setToasts((prev) => {
            // Keep only last 3 toasts
            const trimmed = prev.slice(-2);
            return [...trimmed, next];
        });

        if (next.timeoutMs > 0) {
            window.setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, next.timeoutMs);
        }
    }, []);

    const remove = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return useMemo(
        () => ({
            toasts,
            push,
            remove,
        }),
        [toasts, push, remove],
    );
}
