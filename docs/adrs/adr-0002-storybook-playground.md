# 0002: Use Storybook 8 as the component playground for v0.1

- Status: Accepted
- Date: 2025-07-25

## Context
We need an interactive playground to demo and test components, run axe checks and visual regression, and give users copy-pasteable examples. shadcn/ui relies on a Next.js docs site, but Storybook provides built-in testing and addon ecosystem. Alternatives: Ladle (faster dev), plain Next docs, or custom playground.

## Decision
Adopt Storybook 8 for v0.1:
- Stories for every component (headless and styled).
- Use @storybook/test-runner for axe and interaction tests.
- Keep the integration thin so we can swap to Ladle later if start-up time becomes a problem.

## Consequences
Positive:
- Mature ecosystem (addons, Chromatic), easy CI integration.
- Shared pattern many contributors know.

Negative:
- Start-up time and config weight compared to Ladle.
- Two docs surfaces (Storybook + guide site) to maintain.

Mitigations:
- Wrap Storybook config in `stories/` folder with minimal custom code.
- Revisit after v0.1; create ADR if we migrate.

## Alternatives considered
- **Ladle**: faster and simpler, but fewer addons.
- **Only Next.js docs site**: simpler stack, but we would rebuild tooling for testing and addons.
- **Custom playground**: too much work for v0.1.

