import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  actionText?: string;
  onAction?: () => void;
  duration?: number;
}

interface NotificationContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, options?: { actionText?: string; onAction?: () => void; duration?: number }) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', options?: { actionText?: string; onAction?: () => void; duration?: number }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = options?.duration ?? 4000;
    const newToast: Toast = {
      id,
      message,
      type,
      actionText: options?.actionText,
      onAction: options?.onAction,
      duration,
    };

    setToasts(prev => [...prev.slice(-3), newToast]); // keep max 4 toasts

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <NotificationContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
}
