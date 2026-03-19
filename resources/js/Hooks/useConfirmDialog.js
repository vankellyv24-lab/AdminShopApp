import { useCallback, useState } from 'react';

export default function useConfirmDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [state, setState] = useState({
        title: 'Confirm',
        message: 'Are you sure?',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        tone: 'danger',
        onConfirm: null,
    });

    const open = useCallback((options) => {
        setState((prev) => ({ ...prev, ...options }));
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    const confirm = useCallback(() => {
        const fn = state.onConfirm;
        setIsOpen(false);
        if (typeof fn === 'function') {
            fn();
        }
    }, [state.onConfirm]);

    return {
        isOpen,
        state,
        open,
        close,
        confirm,
    };
}
