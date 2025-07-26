import React, { useEffect, useRef, useState } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number; // ms
  onClose?: () => void;
}

const VARIANT_STYLES: Record<ToastVariant, React.CSSProperties> = {
  success: { borderLeft: '4px solid #22c55e' },
  error: { borderLeft: '4px solid #ef4444' },
  warning: { borderLeft: '4px solid #facc15' },
  info: { borderLeft: '4px solid #3b82f6' },
};

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  variant = 'info',
  duration = 3000,
  onClose,
}) => {
  const [progress, setProgress] = useState(100);
  const [paused, setPaused] = useState(false);
  const startRef = useRef(Date.now());
  const remainingRef = useRef(duration);
  const timerRef = useRef<NodeJS.Timeout>();

  const tick = () => {
    const elapsed = Date.now() - startRef.current;
    const remaining = Math.max(remainingRef.current - elapsed, 0);
    setProgress((remaining / duration) * 100);
    if (remaining <= 0) {
      clearInterval(timerRef.current);
      onClose?.();
    }
  };

  const startTimer = () => {
    startRef.current = Date.now();
    timerRef.current = setInterval(tick, 100);
  };

  const pauseTimer = () => {
    clearInterval(timerRef.current);
    const elapsed = Date.now() - startRef.current;
    remainingRef.current -= elapsed;
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const handleMouseEnter = () => {
    setPaused(true);
    pauseTimer();
  };

  const handleMouseLeave = () => {
    setPaused(false);
    startTimer();
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      data-id={id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        color: '#000',
        padding: '8px 12px',
        marginBottom: '8px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        ...VARIANT_STYLES[variant],
      }}
      data-variant={variant}
    >
      <div style={{ flex: 1 }}>{message}</div>
      <div
        style={{
          height: '2px',
          background: 'rgba(0,0,0,0.1)',
          marginTop: '4px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progress}%`,
            background: 'currentColor',
            transition: paused ? 'none' : 'width 0.1s linear',
          }}
        />
      </div>
    </div>
  );
};
