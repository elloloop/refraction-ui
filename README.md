# 🌈 Refraction UI

[![CI](https://img.shields.io/github/actions/workflow/status/YOUR_ORG/refraction-ui/ci.yml?label=CI)](#) [![npm](https://img.shields.io/npm/v/@refraction-ui/react.svg)](#) ![license](https://img.shields.io/badge/license-MIT-blue.svg) ![a11y](https://img.shields.io/badge/a11y-WCAG%202.1%20AA-5c6ac4.svg) ![bundle size](https://img.shields.io/badge/component%20%3C%206KB%20gz-ok-brightgreen.svg)

Refraction UI is a shadcn-like, source-first UI kit that is **theming first** and **engine swappable**. You copy the code, you own the code.

## ✨ Highlights

- 🎨 Multi-brand themes with light and dark modes (runtime switch via CSS vars)
- 🧩 Headless React primitives plus styled wrappers
- 🛠️ CLI: `init`, `add`, `upgrade`, token import/build, a11y check
- 🤖 MCP server so LLMs and IDEs can generate or upgrade components
- ♿ Accessibility baked in (axe in CI, keyboard support, docs notes)
- 📚 Storybook 8 playground and a guide site with copy-paste snippets

## 🚀 Quick start

```bash
# clone and install
pnpm install

# build and test everything
pnpm build && pnpm test

# run the CLI locally
pnpm --filter @refraction-ui/cli build
pnpm dlx ./packages/cli/dist/index.js --help
```

Bootstrap a new project:

```bash
npx refraction-ui init
npx refraction-ui add button dialog
```

## 🗂️ Repo layout

```
packages/
  tokens-core/        token schema, loaders, CSS var builder
  react/              headless primitives + styled wrappers
  engines/            behavior adapters (radix, headlessui)
  cli/                generator, patchers, a11y runner
  mcp-server/         JSON-RPC tools for IDEs and LLMs
templates/            component and flow blueprints
docs/                 architecture, PRD, NFRs, policies
issues/               markdown issues with dependencies
```

## 🎨 Theming

1. Put tokens in `refraction-tokens.json` (themes -> modes -> tokens).
2. `npx refraction-ui tokens build` emits `tokens.css` and Tailwind fragments.
3. Wrap your app with `<ThemeProvider />` and use `useTheme()` to switch.

## 🔧 CLI overview

```
refraction-ui init
refraction-ui add <component...>
refraction-ui remove <component>
refraction-ui upgrade <component|all>
refraction-ui tokens import <file>
refraction-ui tokens build
refraction-ui a11y [pattern]
refraction-ui doctor
```

Flags: `--dry`, `--diff`, `--framework`, `--engine`, `--strict`.  
Details: see `docs/contracts/cli-spec.md`.

## 🤖 MCP server

Run the server with Node. Set `MCP_TOKEN` for authentication. Use the `ws` flag to enable the WebSocket transport.

```bash
MCP_TOKEN=secret node packages/mcp-server/src/index.js       # stdio mode
MCP_TOKEN=secret node packages/mcp-server/src/index.js ws    # WebSocket on :8123
```

Tools exposed via JSON-RPC:
`add_component`, `upgrade_component`, `build_tokens`, `validate_tokens`, `init_project`, `a11y_test`.
Schemas live in `docs/contracts/schemas/`.

## ♿ Accessibility

- WCAG 2.1 AA target for all components
- `refraction-ui a11y` fails CI in strict mode on any violation
- Dev overlay available to highlight failing nodes

## 📘 Documentation

- Guides: getting started, theming, CLI, MCP - in `docs/` and the site
- Storybook for interactive examples and tests
- PRD: `docs/requirements/prd-v0.1.md`
- Risks, DoD, versioning policy and more are under `docs/`

## 🧭 Roadmap

- Svelte, Vue, Angular renderers
- More components (Combobox, Date Picker, Data Table)
- Advanced flows and generators
- Remote template registry

See `docs/requirements/prd-v0.1.md` and `docs/risks.md` for planned scope.

## 🤝 Contributing

Please read:

- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `docs/governance.md` (RFC flow)
- Add a Changeset for any package change

Good first issues are labeled `good first issue`.

### 🔐 Setting Up Development Environment

Before contributing, ensure the required secrets are configured:

**Required Secrets:**

- `NPM_TOKEN`: For package publishing to npm (elloloop organization)
- `GITHUB_TOKEN`: Auto-provided by GitHub Actions

**Repository Features:**

- ✅ CodeQL security scanning enabled
- ✅ Dependabot alerts and security updates enabled
- ✅ Branch protection rules configured
- ✅ Dependabot configuration updated

Contact repository maintainers if you need access to additional secrets or features.

## 🔐 Security

Report vulnerabilities privately (contact in README once published). Do not open a public issue.

## 📜 License

MIT (or Apache-2.0). See `LICENSE`.

## 🙏 Acknowledgements

Inspired by shadcn/ui and Radix UI. Thanks to the a11y community and axe-core.
