# 🌈 Refraction UI

**Refraction UI** is an adaptable, theme-first UI component system designed to support **React** (initially) and **Angular**, **Vue**, **Svelte**, and more in later phases. Built on top of **Tailwind CSS**, optional **headless logic**, and native **design token integration**.

---

## 🔮 Why “Refraction”?

Just as light refracts through different mediums, UI should adapt fluidly to themes, brands, and platforms. Refraction UI is built to **bend with your needs**.

---

## ✨ Highlights

- 🎨 **Multi-theme system** using CSS variables and Tailwind
- 🧩 **Component scaffolding CLI**
- 🧱 **Radix-optional behavior adapters**
- 🎛️ **Design token sync** with Figma & Style Dictionary
- 🌐 **Framework-agnostic core** (React first, Angular soon)
- 🧠 **Accessibility-aware** with future audit tools

---

## 🗺 Roadmap

### 🟩 Phase 1: React-First + Theming
- ✅ Base components (Button, Dialog, Input, etc.)
- ✅ Tailwind with `class-variance-authority`
- ✅ Theme switching with `data-theme` + CSS vars
- ✅ CLI: `refui init`, `refui add:button`
- ⏳ Design token generator from JSON

### 🟨 Phase 2: Angular Support
- ⏳ Create Angular bindings with equivalent API
- ⏳ Tailwind + tokens mapped to Angular templates
- ⏳ CLI generator: `refui add:button --framework angular`

### 🟧 Phase 3: Design Token Sync
- ⏳ Pull from Figma Tokens or Token Studio
- ⏳ Export to Style Dictionary format
- ⏳ Generate `:root` + `[data-theme=...]` CSS automatically

### 🟦 Phase 4: Cross-Framework Adapters
- ⏳ Pluggable behavior layers: Radix, Headless UI, custom
- ⏳ Shared core logic for React, Vue, Svelte

### 🟥 Phase 5: Layout & Flow Scaffolding
- ⏳ Auth flows, dashboard layouts, state-connected UIs
- ⏳ Toasts, modals, drawers

### 🟪 Phase 6: Accessibility Confidence
- ⏳ a11y linting overlay (axe-core)
- ⏳ CLI: `refui lint:a11y`

---

## 📦 Packages

```
packages/
├── core/       # Design tokens, utils
├── react/      # React components
├── angular/    # Angular (coming soon)
├── themes/     # CSS vars and token maps
├── cli/        # CLI scaffolding
└── playground/ # Example app
```

---

## 🚀 Quickstart (React)

```bash
npm create refraction-ui@latest
```

Or scaffold directly:

```bash
npx refui init
npx refui add:button
```

---

## 📣 Contributing

Refraction UI is built to scale. Contribute themes, adapters, components, or ideas.

---
