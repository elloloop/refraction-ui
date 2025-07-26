import React, { useState, useRef, useEffect } from 'react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTrigger = 'hover' | 'focus' | 'click';

export interface TooltipProps {
  content: React.ReactNode;
  position?: TooltipPosition;
  trigger?: TooltipTrigger;
  delay?: number; // ms
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactElement;
}

/**
 * Tooltip component with configurable positioning and triggers.
 * Uses aria-describedby and role="tooltip" for accessibility.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  trigger = 'hover',
  delay = 300,
  open: openProp,
  onOpenChange,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number>();

  const controlled = openProp !== undefined;
  const isOpen = controlled ? openProp : open;

  const show = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      if (!controlled) setOpen(true);
      onOpenChange?.(true);
    }, delay);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      if (!controlled) setOpen(false);
      onOpenChange?.(false);
    }, delay);
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const triggerProps: Record<string, any> = {};
  if (trigger === 'hover') {
    triggerProps.onMouseEnter = show;
    triggerProps.onMouseLeave = hide;
  }
  if (trigger === 'focus') {
    triggerProps.onFocus = show;
    triggerProps.onBlur = hide;
  }
  if (trigger === 'click') {
    triggerProps.onClick = () => {
      if (isOpen) hide();
      else show();
    };
  }

  const tooltipId = `tooltip-${useId()}`;

  return (
    <>
      {React.cloneElement(children, {
        ref: (node: HTMLElement) => {
          triggerRef.current = node;
          const { ref } = children as any;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
        },
        'aria-describedby': isOpen ? tooltipId : undefined,
        ...triggerProps,
      })}
      {isOpen && (
        <div
          id={tooltipId}
          role="tooltip"
          ref={tooltipRef}
          style={getPositionStyle(triggerRef.current, position)}
        >
          {content}
          <span className="tooltip-arrow" />
        </div>
      )}
    </>
  );
};

function useId() {
  const [id] = useState(() => Math.random().toString(36).slice(2));
  return id;
}

function getPositionStyle(triggerEl: HTMLElement | null, position: TooltipPosition) {
  if (!triggerEl) return { position: 'absolute' } as React.CSSProperties;
  const rect = triggerEl.getBoundingClientRect();
  const style: React.CSSProperties = { position: 'absolute' };
  switch (position) {
    case 'bottom':
      style.top = rect.bottom + window.scrollY + 8;
      style.left = rect.left + window.scrollX + rect.width / 2;
      style.transform = 'translateX(-50%)';
      break;
    case 'left':
      style.top = rect.top + window.scrollY + rect.height / 2;
      style.left = rect.left + window.scrollX - 8;
      style.transform = 'translate(-100%, -50%)';
      break;
    case 'right':
      style.top = rect.top + window.scrollY + rect.height / 2;
      style.left = rect.right + window.scrollX + 8;
      style.transform = 'translate(0, -50%)';
      break;
    default: // top
      style.top = rect.top + window.scrollY - 8;
      style.left = rect.left + window.scrollX + rect.width / 2;
      style.transform = 'translate(-50%, -100%)';
  }
  return style;
}
