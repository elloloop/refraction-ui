import React, { useRef, useEffect, useState, HTMLAttributes, forwardRef, RefObject } from 'react';
import { CommandInput as CommandInputCore, type Trigger } from '@refraction-ui/command-input';
import { cn } from '@refraction-ui/shared';

export interface CommandInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  triggers?: Trigger[];
  renderPopover?: (props: {
    isOpen: boolean;
    trigger: string;
    search: string;
    close: () => void;
    position: { top: number; left: number };
  }) => React.ReactNode;
}

export const CommandInput = forwardRef<HTMLDivElement, CommandInputProps>(
  (
    {
      value = '',
      onChange,
      triggers = [],
      renderPopover,
      className,
      ...props
    },
    ref
  ) => {
    const localRef = useRef<HTMLDivElement>(null);
    const containerRef = (ref || localRef) as RefObject<HTMLDivElement>;
    
    const [popoverState, setPopoverState] = useState<{
      isOpen: boolean;
      trigger: string;
      search: string;
      position: { top: number; left: number };
    }>({
      isOpen: false,
      trigger: '',
      search: '',
      position: { top: 0, left: 0 }
    });

    const coreRef = useRef<CommandInputCore | null>(null);

    useEffect(() => {
      if (containerRef.current && !coreRef.current) {
        coreRef.current = new CommandInputCore({
          triggers,
          onCommandTriggered: (trigger, search) => {
            setPopoverState({
              isOpen: true,
              trigger: trigger.char,
              search: search,
              position: { top: 0, left: 0 },
            });
          },
          onCommandCancel: () => {
            setPopoverState((prev) => ({ ...prev, isOpen: false }));
          },
          onStateChange: (state) => {
            onChange?.(state.rawText);
          },
        });
      }
    }, [triggers, onChange]);

    // Handle external value changes
    useEffect(() => {
      if (
        containerRef.current &&
        containerRef.current.innerHTML !== value &&
        coreRef.current
      ) {
        containerRef.current.innerHTML = value;
      }
    }, [value]);

    return (
      <div className={cn('relative w-full', className)}>
        <div
          ref={containerRef}
          contentEditable
          suppressContentEditableWarning
          className="w-full min-h-[40px] p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          onInput={(e) => {
            coreRef.current?.handleInput(e.currentTarget.textContent || '', 0);
          }}
          onKeyDown={(e) => {
            coreRef.current?.handleKeyDown(e.key, e as any);
          }}
          {...props}
        />
        {renderPopover && renderPopover({
          ...popoverState,
          close: () => setPopoverState((prev) => ({ ...prev, isOpen: false })),
        })}
      </div>
    );
  }
);

CommandInput.displayName = 'CommandInput';
