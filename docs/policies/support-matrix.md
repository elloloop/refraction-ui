# Support Matrix

| Area            | Minimum / Target | Notes |
|-----------------|------------------|-------|
| Node.js         | 18.x LTS         | Tested on 18 & 20 |
| React           | 18.2             | Hooks-based APIs |
| Tailwind CSS    | 3.4              | Optional but default path |
| TypeScript      | 5.0              | `strict` mode required |
| Browsers        | Evergreen (Chrome/Edge/Firefox/Safari latest 2) | IE not supported |
| Mobile browsers | iOS Safari 16+, Chrome Android latest 2         | |
| SSR             | Next.js 13+ (app or pages), Remix (later)       | Must be hydration-safe |
| Storybook       | 8.x              | Can migrate later |
| Package format  | ESM + types      | CJS stub for Node tools ok |
| OS for CLI      | macOS, Linux, Windows PowerShell                | Tested in CI on ubuntu & windows |
