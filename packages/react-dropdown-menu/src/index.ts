export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  type DropdownMenuProps,
  type DropdownMenuTriggerProps,
  type DropdownMenuContentProps,
  type DropdownMenuItemProps,
  type DropdownMenuSeparatorProps,
  type DropdownMenuLabelProps,
} from './dropdown-menu.js'

// Re-export headless types for convenience
export {
  type DropdownMenuProps as CoreDropdownMenuProps,
  type MenuItemProps,
  type DropdownMenuAPI,
  type DropdownMenuState,
  menuContentVariants,
  menuItemVariants,
} from '@elloloop/dropdown-menu'
