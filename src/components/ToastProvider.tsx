import React, { createContext, useCallback, useContext, useState } from 'react';
import { Toast, ToastProps } from './Toast';

export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

export interface ToastContextValue {
  addToast: (toast: Omit<ToastProps, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let counter = 0;

export const ToastProvider: React.FC<{ position?: ToastPosition }> = ({
  children,
  position = 'top-right',
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastProps, 'id'>) => {
      const id = `${Date.now()}-${counter++}`;
      setToasts((prev) => [...prev, { ...toast, id, onClose: () => removeToast(id) }]);
    },
    [removeToast]
  );

  const context: ToastContextValue = { addToast };

  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = { position: 'fixed', zIndex: 1000 };
    const spacing = 16;
    switch (position) {
      case 'top-right':
        return { ...base, top: spacing, right: spacing };
      case 'top-left':
        return { ...base, top: spacing, left: spacing };
      case 'bottom-right':
        return { ...base, bottom: spacing, right: spacing };
      case 'bottom-left':
        return { ...base, bottom: spacing, left: spacing };
      case 'top-center':
        return { ...base, top: spacing, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-center':
        return { ...base, bottom: spacing, left: '50%', transform: 'translateX(-50%)' };
      default:
        return base;
    }
  };

  return (
    <ToastContext.Provider value={context}>
      {children}
      <div style={getPositionStyles()}>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
