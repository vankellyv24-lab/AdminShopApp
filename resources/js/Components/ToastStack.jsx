const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
};

const iconMap = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
};

export default function ToastStack({ toasts, onDismiss }) {
    if (!toasts?.length) return null;

    return (
        <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`w-72 rounded-lg border shadow-lg ${typeStyles[t.type] || typeStyles.info}`}
                >
                    <div className="flex items-center gap-3 p-3">
                        <span className="text-lg">{iconMap[t.type] || iconMap.info}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {t.title || t.message}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onDismiss(t.id)}
                            className="opacity-60 hover:opacity-100 text-current"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
