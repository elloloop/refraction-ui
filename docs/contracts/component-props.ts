// Canonical component prop types referenced in COMP-API-CONTRACT
// These interfaces define the baseline for all core components in Refraction UI.

import type { CSSProperties, ReactNode, Ref, ElementType } from 'react';

/** Base props shared by all components */
export interface BaseProps {
  /** Unique id attribute */
  id?: string;
  /** Additional classes for styling and theming */
  className?: string;
  /** Inline styles, including CSS custom properties */
  style?: CSSProperties;
  /** Generic data attributes for custom hooks or automation */
  [dataAttr: `data-${string}`]: string | undefined;
}

/** Accessibility related props */
export interface AccessibilityProps {
  role?: string;
  tabIndex?: number;
  /** ARIA attributes */
  ['aria-label']?: string;
  ['aria-labelledby']?: string;
  ['aria-describedby']?: string;
  ['aria-controls']?: string;
  ['aria-expanded']?: boolean;
  ['aria-selected']?: boolean;
  ['aria-hidden']?: boolean;
}

/** Event handler props shared by interactive components */
export interface EventProps<T = Element> {
  onClick?: React.MouseEventHandler<T>;
  onFocus?: React.FocusEventHandler<T>;
  onBlur?: React.FocusEventHandler<T>;
  onKeyDown?: React.KeyboardEventHandler<T>;
  onKeyUp?: React.KeyboardEventHandler<T>;
  onPointerDown?: React.PointerEventHandler<T>;
  onPointerUp?: React.PointerEventHandler<T>;
}

/** Props supporting composition patterns */
export interface CompositionProps {
  children?: ReactNode;
  /** Render the component as a different element */
  asChild?: boolean;
  /** Custom element type for polymorphic components */
  as?: ElementType;
}

/** Theme customization props */
export interface ThemeProps {
  variant?: string;
  size?: string;
  colorScheme?: string;
  disabled?: boolean;
}

/** Ref forwarding support */
export interface RefProps<T> {
  ref?: Ref<T>;
}

// --- Component specific props ---

/** Button component */
export interface ButtonProps
  extends BaseProps,
    AccessibilityProps,
    EventProps<HTMLButtonElement>,
    CompositionProps,
    ThemeProps,
    RefProps<HTMLButtonElement> {
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
}

/** Input component */
export interface InputProps
  extends BaseProps,
    AccessibilityProps,
    EventProps<HTMLInputElement>,
    CompositionProps,
    ThemeProps,
    RefProps<HTMLInputElement> {
  name?: string;
  type?:
    | 'text'
    | 'password'
    | 'email'
    | 'number'
    | 'tel'
    | 'url'
    | 'search'
    | 'date'
    | 'time';
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  /** Controlled input change handler */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

/** Dialog component */
export interface DialogProps
  extends BaseProps,
    AccessibilityProps,
    EventProps<HTMLDivElement>,
    CompositionProps,
    ThemeProps,
    RefProps<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}

/** Dropdown Menu component */
export interface DropdownProps
  extends BaseProps,
    AccessibilityProps,
    EventProps<HTMLDivElement>,
    CompositionProps,
    ThemeProps,
    RefProps<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

/** Popover component */
export interface PopoverProps
  extends BaseProps,
    AccessibilityProps,
    EventProps<HTMLDivElement>,
    CompositionProps,
    ThemeProps,
    RefProps<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

/** Tabs component */
export interface TabsProps
  extends BaseProps,
    AccessibilityProps,
    EventProps<HTMLDivElement>,
    CompositionProps,
    ThemeProps,
    RefProps<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
}

/** Toast component */
export interface ToastProps
  extends BaseProps,
    AccessibilityProps,
    EventProps<HTMLDivElement>,
    CompositionProps,
    ThemeProps,
    RefProps<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
}

/** Tooltip component */
export interface TooltipProps
  extends BaseProps,
    AccessibilityProps,
    EventProps<HTMLDivElement>,
    CompositionProps,
    ThemeProps,
    RefProps<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export type CoreComponentProps =
  | ButtonProps
  | InputProps
  | DialogProps
  | DropdownProps
  | PopoverProps
  | TabsProps
  | ToastProps
  | TooltipProps;

