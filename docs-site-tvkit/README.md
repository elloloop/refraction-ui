# tvkit-docs

Documentation site for [tvkit](https://github.com/elloloop/tvkit). Next.js
15 App Router + React 19 + Tailwind 4, built against refraction-ui's
workspace packages. Deployed to `https://elloloop.github.io/tvkit/`.

## Development

```bash
pnpm install
pnpm --filter tvkit-docs dev
```

Dev server defaults to http://localhost:3000.

## Static build for GitHub Pages

The site is statically exported and served from the `tvkit` repo's
`gh-pages` branch under `/tvkit/`:

```bash
GITHUB_PAGES=true pnpm --filter tvkit-docs build
```

Output lands in `docs-site-tvkit/out/`. The `GITHUB_PAGES=true` env var
switches Next.js into `output: 'export'` mode and sets `basePath` to
`/tvkit`. Without it, `next build` produces a standard server bundle
(useful for local previews).

### Local preview of the export

```bash
npx serve docs-site-tvkit/out -p 4173
# open http://localhost:4173/tvkit/
```

## Deploying

The built `out/` directory is pushed to `elloloop/tvkit`'s `gh-pages`
branch. That repo's GitHub Pages configuration serves from the branch
root, so the final URL is `https://elloloop.github.io/tvkit/`.

Do not push directly to `gh-pages` from this workflow — the tvkit repo
is the source of truth for its deploy. Hand the contents of `out/` to
whichever process owns the `gh-pages` branch on `elloloop/tvkit`.
