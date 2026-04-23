# @refraction-ui/astro-app-shell

App-style layout primitives.

## Composition

The header lives inside `AppShellMain`, **not** as a sibling of the sidebar:

```astro
<AppShell>
  <AppShellSidebar>...</AppShellSidebar>
  <AppShellMain>
    <AppShellHeader>...</AppShellHeader>
    <AppShellContent>...</AppShellContent>
  </AppShellMain>
  <AppShellOverlay />
</AppShell>
```

`<AppShell>` is a flex-row with sidebar + main as siblings. Putting the header at the top level collapses it into a thin column.
