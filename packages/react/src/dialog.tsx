import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

const FOCUSABLE =
  'a[href], area[href], input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"], [disabled]), [contenteditable]';

function useFocusTrap<T extends HTMLElement>(active: boolean, containerRef: React.RefObject<T | null>) {
  useEffect(() => {
    if (!active || !containerRef.current) return;
    const node = containerRef.current;
    const focusables = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (first) first.focus(); else node.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, containerRef]);
}

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  backdrop?: boolean;
  allowEscapeClose?: boolean;
  allowBackdropClose?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Dialog({
  open,
  defaultOpen = false,
  onOpenChange,
  position = 'center',
  backdrop = true,
  allowEscapeClose = true,
  allowBackdropClose = true,
  children,
  className,
  style,
}: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open !== undefined ? open : internalOpen;
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusTrap<HTMLDivElement>(isOpen, containerRef);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && allowEscapeClose) {
        onOpenChange?.(false);
        setInternalOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, allowEscapeClose, onOpenChange]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (allowBackdropClose) {
      onOpenChange?.(false);
      setInternalOpen(false);
    }
  };

  const posStyles: React.CSSProperties = {};
  switch (position) {
    case 'top':
      posStyles.alignItems = 'flex-start';
      posStyles.justifyContent = 'center';
      break;
    case 'bottom':
      posStyles.alignItems = 'flex-end';
      posStyles.justifyContent = 'center';
      break;
    case 'left':
      posStyles.alignItems = 'center';
      posStyles.justifyContent = 'flex-start';
      break;
    case 'right':
      posStyles.alignItems = 'center';
      posStyles.justifyContent = 'flex-end';
      break;
    default:
      posStyles.alignItems = 'center';
      posStyles.justifyContent = 'center';
  }

  const dialog = (
    <div
      role="dialog"
      aria-modal="true"
      ref={containerRef}
      tabIndex={-1}
      data-state={isOpen ? 'open' : 'closed'}
      style={{
        background: 'var(--dialog-bg, #fff)',
        color: 'var(--dialog-fg, #000)',
        padding: '1rem',
        borderRadius: 'var(--dialog-radius, 0.5rem)',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        zIndex: 1001,
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );

  const content = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        ...posStyles,
        zIndex: 1000,
      }}
    >
      {backdrop && (
        <div
          onClick={handleBackdropClick}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--backdrop-bg, rgba(0,0,0,0.5))',
          }}
          data-state={isOpen ? 'open' : 'closed'}
        />
      )}
      {dialog}
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
}
