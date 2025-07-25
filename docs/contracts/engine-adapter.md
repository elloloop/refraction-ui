# Engine Adapter Contract

Goal: allow Dialog, Popover and similar primitives to run on different behavior engines (internal, Radix, Headless UI) without changing consumer JSX.

## Concepts

- **Canonical API**: our prop names and component parts (Root, Trigger, Content, etc)
- **Adapter**: maps canonical props/events to an engine
- **Engine selection**: per component via prop or globally via provider

## Type interface

```ts
export interface EngineAdapter<CPropsMap> {
  Root: React.ComponentType<CPropsMap["Root"]>;
  parts?: {
    [K in keyof CPropsMap as Exclude<K, "Root">]: React.ComponentType<CPropsMap[K]>;
  };
  setup?(opts: { portalContainer?: HTMLElement }): void;
}
```

Example prop map for Dialog:

```ts
type DialogPropsMap = {
  Root: { open?: boolean; onOpenChange?(v: boolean): void };
  Trigger: React.ComponentProps<"button">;
  Content: { forceMount?: boolean } & React.ComponentProps<"div">;
  Overlay: React.ComponentProps<"div">;
  Title: React.ComponentProps<"h2">;
  Description: React.ComponentProps<"p">;
};
```

## Usage

```tsx
<Dialog engine="radix">
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogTitle>Title</DialogTitle>
    <DialogDescription>Body</DialogDescription>
  </DialogContent>
</Dialog>
```

Provider style:

```tsx
<RefractionProvider engineDefaults={{ dialog: "radix" }}>
  <App />
</RefractionProvider>
```

## Contract tests

- Run the same Storybook story with each engine and compare axe results
- Snapshot DOM for key states
- Interaction tests (keyboard, focus trap) must pass for all engines

## Data attributes

- Engines must forward `data-state`, `data-disabled`, etc. so styling stays stable
- Adapters add missing attrs if the engine does not provide them

## Error handling

- If an engine lacks a part, fail at build time with a typed error
- If a runtime mismatch occurs, warn once in dev

## Versioning

- Keep adapter API stable, deprecate via types and codemods
- Engine packages expose their own version, recorded in component file headers to support `upgrade`
