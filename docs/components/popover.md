# Popover

A floating panel that displays content relative to a trigger element.

## Usage

```tsx
import { Popover } from '@refraction-ui/react';

function Example() {
  return (
    <Popover trigger={<button>Open</button>} placement="bottom" triggerType="click" arrow backdrop>
      <div className="p-4 bg-white border rounded shadow">Hello world</div>
    </Popover>
  );
}
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `open` | `boolean` | Controlled open state |
| `defaultOpen` | `boolean` | Uncontrolled initial state |
| `onOpenChange` | `(open: boolean) => void` | Callback when open state changes |
| `trigger` | `ReactElement` | Element that opens the popover |
| `placement` | `'top' | 'bottom' | 'left' | 'right'` | Position relative to trigger |
| `triggerType` | `'hover' | 'click' | 'focus'` | Interaction to open |
| `offset` | `number` | Distance in pixels from trigger |
| `arrow` | `boolean` | Show arrow pointing to trigger |
| `backdrop` | `boolean` | Show backdrop overlay |
| `className` | `string` | Classes for popover container |
| `arrowClassName` | `string` | Classes for arrow element |
| `backdropClassName` | `string` | Classes for backdrop element |
| `zIndex` | `number` | Z-index for the popover |

