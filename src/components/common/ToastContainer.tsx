import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const borders = {
    success: 'border-l-4 border-l-emerald-500',
    error: 'border-l-4 border-l-rose-500',
    warning: 'border-l-4 border-l-amber-500',
    info: 'border-l-4 border-l-blue-500',
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-4 transition-all duration-300 animate-in slide-in-from-top-4 ${borders[toast.type]}`}
        >
          {icons[toast.type]}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
              {toast.message}
            </p>
            {toast.actionText && toast.onAction && (
              <button
                onClick={() => {
                  toast.onAction?.();
                  removeToast(toast.id);
                }}
                className="mt-2 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
              >
                {toast.actionText}
              </button>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
