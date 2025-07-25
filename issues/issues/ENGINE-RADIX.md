---
id: ENGINE-RADIX
track: engines
depends_on: ["ENGINE-ADAPTER-IFACE", "COMP-DIALOG"]
size: M
labels: [feat]
---

## Summary

Radix adapter for Dialog (plus sample others)

## Acceptance Criteria

- [ ] `RadixEngineAdapter` implements `EngineAdapter` interface
- [ ] Adapter maps Refraction props to Radix UI components
- [ ] Adapter supports all core components (Button, Dialog, Input, etc.)
- [ ] Adapter maintains accessibility features from Radix UI
- [ ] Adapter supports theme integration with CSS custom properties
- [ ] Adapter handles event mapping between Refraction and Radix
- [ ] Adapter supports ref forwarding and DOM manipulation
- [ ] Adapter supports composition patterns (asChild, etc.)
- [ ] Adapter provides consistent API across all components
- [ ] Adapter supports Radix UI's built-in animations and transitions
- [ ] Adapter handles Radix UI's portal and overlay management
- [ ] Adapter supports Radix UI's focus management and keyboard navigation
- [ ] Adapter provides proper TypeScript types for all components
- [ ] Adapter supports Radix UI's form integration features
- [ ] Adapter handles Radix UI's responsive design patterns
- [ ] Adapter supports Radix UI's validation and error states
- [ ] Unit tests with 90%+ coverage
- [ ] Integration tests verify component parity
- [ ] Performance tests ensure minimal overhead

## Tasks

- [ ] Implement RadixEngineAdapter class
- [ ] Create prop mapping for Button component
- [ ] Create prop mapping for Dialog component
- [ ] Create prop mapping for Input component
- [ ] Create prop mapping for Dropdown component
- [ ] Create prop mapping for Tabs component
- [ ] Create prop mapping for Toast component
- [ ] Create prop mapping for Tooltip component
- [ ] Create prop mapping for Popover component
- [ ] Implement theme integration
- [ ] Add event handling and callbacks
- [ ] Implement ref forwarding
- [ ] Add composition pattern support
- [ ] Create comprehensive unit tests
- [ ] Add integration tests
- [ ] Add performance benchmarks
- [ ] Create documentation and examples

## Technical Requirements

- **Radix UI**: Use latest version with all primitives
- **Prop Mapping**: Consistent mapping between Refraction and Radix
- **Accessibility**: Preserve Radix UI's accessibility features
- **Performance**: Minimal overhead compared to direct Radix usage
- **TypeScript**: Full type safety and IntelliSense support
- **Testing**: Comprehensive test coverage

## Supported Components

- **Button**: Maps to Radix UI Button primitive
- **Dialog**: Maps to Radix UI Dialog primitive
- **Input**: Maps to Radix UI TextField primitive
- **Dropdown**: Maps to Radix UI DropdownMenu primitive
- **Tabs**: Maps to Radix UI Tabs primitive
- **Toast**: Maps to Radix UI Toast primitive
- **Tooltip**: Maps to Radix UI Tooltip primitive
- **Popover**: Maps to Radix UI Popover primitive

## Prop Mapping Examples

```typescript
// Refraction Button props
interface ButtonProps {
  variant: "primary" | "secondary";
  size: "sm" | "md" | "lg";
  disabled?: boolean;
}

// Radix Button props
interface RadixButtonProps {
  className: string; // Generated from variant/size
  disabled?: boolean;
  // ... other Radix props
}
```

## Notes

- Must preserve Radix UI's accessibility features
- Consider performance implications of prop mapping
- Support for Radix UI's latest features and updates
- Provide clear documentation for custom Radix UI usage
- Support for Radix UI's composition patterns
