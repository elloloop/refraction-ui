# @refraction-ui/react-dialog

Dialog/modal component for React. Part of [Refraction UI](https://elloloop.github.io/refraction-ui/).

## Install

```bash
pnpm add @refraction-ui/react-dialog
```

## Usage

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@refraction-ui/react-dialog'

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

## Exports

Dialog, DialogTrigger, DialogContent, DialogOverlay, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose

## License

MIT
