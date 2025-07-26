import React, {useState, useEffect, useRef} from 'react';

export interface DropdownProps {
  trigger: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  hover?: boolean;
  children: React.ReactNode;
}

export function Dropdown({
  trigger,
  open: openProp,
  onOpenChange,
  placement = 'bottom-start',
  hover = false,
  children,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const actualOpen = isControlled ? openProp : open;

  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const setOpenState = (state: boolean) => {
    if (!isControlled) setOpen(state);
    onOpenChange?.(state);
  };

  const handleDocumentClick = (e: MouseEvent) => {
    if (
      !menuRef.current?.contains(e.target as Node) &&
      !triggerRef.current?.contains(e.target as Node)
    ) {
      setOpenState(false);
    }
  };

  useEffect(() => {
    if (actualOpen) {
      document.addEventListener('mousedown', handleDocumentClick);
    } else {
      document.removeEventListener('mousedown', handleDocumentClick);
    }
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [actualOpen]);

  const toggleOpen = () => setOpenState(!actualOpen);
  const openMenu = () => setOpenState(true);
  const closeMenu = () => setOpenState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') || []
    );
    const activeIndex = items.indexOf(document.activeElement as HTMLElement);
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = items[activeIndex + 1] || items[0];
        next?.focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = items[activeIndex - 1] || items[items.length - 1];
        prev?.focus();
        break;
      }
      case 'Home':
        e.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        items[items.length - 1]?.focus();
        break;
      case 'Escape':
        closeMenu();
        (triggerRef.current as HTMLElement | null)?.focus();
        break;
      default:
        break;
    }
  };

  const triggerProps = {
    ref: triggerRef,
    'aria-haspopup': 'menu',
    'aria-expanded': actualOpen,
    onClick: toggleOpen,
    onMouseEnter: hover ? openMenu : undefined,
    onMouseLeave: hover ? closeMenu : undefined,
  } as const;

  const contentStyles: React.CSSProperties = {
    position: 'absolute',
    top: placement.startsWith('bottom') ? '100%' : undefined,
    bottom: placement.startsWith('top') ? '100%' : undefined,
    left: placement.endsWith('start') ? '0' : undefined,
    right: placement.endsWith('end') ? '0' : undefined,
    zIndex: 1000,
    background: 'white',
    border: '1px solid #ccc',
    minWidth: '160px',
    padding: '4px 0',
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {React.cloneElement(trigger, triggerProps)}
      {actualOpen && (
        <div
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          style={contentStyles}
          onKeyDown={handleKeyDown}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export interface DropdownItemProps {
  icon?: React.ReactNode;
  disabled?: boolean;
  onSelect?: () => void;
  children: React.ReactNode;
}

export function DropdownItem({ icon, disabled, onSelect, children }: DropdownItemProps) {
  const handleClick = () => {
    if (!disabled) onSelect?.();
  };
  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {icon && <span style={{ marginRight: 4 }}>{icon}</span>}
      {children}
    </div>
  );
}

export function DropdownSeparator() {
  return <div role="separator" style={{ borderTop: '1px solid #eee', margin: '4px 0' }} />;
}

export interface DropdownCheckboxItemProps {
  checked?: boolean;
  onCheckedChange?: (value: boolean) => void;
  children: React.ReactNode;
}

export function DropdownCheckboxItem({ checked: checkedProp, onCheckedChange, children }: DropdownCheckboxItemProps) {
  const [checked, setChecked] = useState(!!checkedProp);
  const isControlled = checkedProp !== undefined;
  const actualChecked = isControlled ? checkedProp : checked;

  const toggle = () => {
    if (!isControlled) setChecked(!actualChecked);
    onCheckedChange?.(!actualChecked);
  };

  return (
    <DropdownItem icon={actualChecked ? '✓' : undefined} onSelect={toggle}>
      {children}
    </DropdownItem>
  );
}

export interface DropdownRadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactElement<DropdownRadioItemProps>[];
}

export function DropdownRadioGroup({ value: valueProp, onValueChange, children }: DropdownRadioGroupProps) {
  const [value, setValue] = useState(valueProp);
  const isControlled = valueProp !== undefined;
  const current = isControlled ? valueProp : value;

  const select = (val: string) => {
    if (!isControlled) setValue(val);
    onValueChange?.(val);
  };

  return (
    <div role="group">
      {React.Children.map(children, child =>
        React.cloneElement(child, {
          checked: child.props.value === current,
          onSelect: () => select(child.props.value),
        })
      )}
    </div>
  );
}

export interface DropdownRadioItemProps {
  value: string;
  checked?: boolean;
  onSelect?: () => void;
  children: React.ReactNode;
}

export function DropdownRadioItem({ checked, onSelect, children }: DropdownRadioItemProps) {
  return (
    <DropdownItem icon={checked ? '•' : undefined} onSelect={onSelect}>
      {children}
    </DropdownItem>
  );
}

export interface DropdownSubmenuProps {
  label: React.ReactNode;
  children: React.ReactNode;
}

export function DropdownSubmenu({ label, children }: DropdownSubmenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const openSub = () => setOpen(true);
  const closeSub = () => setOpen(false);

  const handleDocumentClick = (e: MouseEvent) => {
    if (!ref.current?.contains(e.target as Node)) {
      closeSub();
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleDocumentClick);
    } else {
      document.removeEventListener('mousedown', handleDocumentClick);
    }
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [open]);

  const contentStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: '100%',
    background: 'white',
    border: '1px solid #ccc',
    minWidth: '160px',
    padding: '4px 0',
    zIndex: 1000,
  };

  return (
    <div
      ref={ref}
      role="none"
      onMouseEnter={openSub}
      onMouseLeave={closeSub}
      style={{ position: 'relative' }}
    >
      <DropdownItem icon="▶" onSelect={openSub}>{label}</DropdownItem>
      {open && (
        <div role="menu" style={contentStyles}>
          {children}
        </div>
      )}
    </div>
  );
}
