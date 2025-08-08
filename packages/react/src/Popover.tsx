import React, { useState, useRef, useEffect, ReactElement, ReactNode } from 'react';

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';
export type PopoverTriggerType = 'hover' | 'click' | 'focus';

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: ReactElement;
  children: ReactNode;
  placement?: PopoverPlacement;
  offset?: number;
  arrow?: boolean;
  triggerType?: PopoverTriggerType;
  backdrop?: boolean;
  className?: string;
  style?: React.CSSProperties;
  arrowClassName?: string;
  backdropClassName?: string;
  zIndex?: number;
}

export function Popover({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  children,
  placement = 'bottom',
  offset = 8,
  arrow = false,
  triggerType = 'click',
  backdrop = false,
  className,
  style,
  arrowClassName,
  backdropClassName,
  zIndex = 50,
}: PopoverProps) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open! : internalOpen;

  const show = () => {
    if (!isControlled) setInternalOpen(true);
    onOpenChange?.(true);
  };

  const hide = () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
  };

  const toggle = () => (isOpen ? hide() : show());

  useEffect(() => {
    const node = triggerRef.current;
    if (!node) return;

    const onClick = (e: MouseEvent) => {
      if (triggerType === 'click') {
        e.preventDefault();
        toggle();
      }
    };
    const onMouseEnter = () => triggerType === 'hover' && show();
    const onMouseLeave = () => triggerType === 'hover' && hide();
    const onFocus = () => triggerType === 'focus' && show();
    const onBlur = () => triggerType === 'focus' && hide();

    node.addEventListener('click', onClick);
    node.addEventListener('mouseenter', onMouseEnter);
    node.addEventListener('mouseleave', onMouseLeave);
    node.addEventListener('focus', onFocus);
    node.addEventListener('blur', onBlur);

    return () => {
      node.removeEventListener('click', onClick);
      node.removeEventListener('mouseenter', onMouseEnter);
      node.removeEventListener('mouseleave', onMouseLeave);
      node.removeEventListener('focus', onFocus);
      node.removeEventListener('blur', onBlur);
    };
  }, [triggerType, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        hide();
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isOpen]);

  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen || !triggerRef.current || !popoverRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top - popoverRect.height - offset;
        left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + offset;
        left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
        break;
      case 'left':
        top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
        left = triggerRect.left - popoverRect.width - offset;
        break;
      case 'right':
        top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
        left = triggerRect.right + offset;
        break;
    }

    setPosition({ top: Math.max(0, top), left: Math.max(0, left) });
  }, [isOpen, placement, offset]);

  const popoverStyle: React.CSSProperties = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    zIndex,
    ...style,
  };

  return (
    <>
      {React.cloneElement(trigger, { ref: (node: HTMLElement) => (triggerRef.current = node) })}
      {isOpen && (
        <>
          {backdrop && (
            <div
              className={backdropClassName}
              style={{ position: 'fixed', inset: 0, zIndex: zIndex - 1, background: 'rgba(0,0,0,0.3)' }}
              onClick={hide}
            />
          )}
          <div ref={popoverRef} className={className} style={popoverStyle} role="dialog" aria-modal="false">
            {children}
            {arrow && <div className={arrowClassName} data-arrow />}
          </div>
        </>
      )}
    </>
  );
}

