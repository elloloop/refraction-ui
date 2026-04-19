.PHONY: ci install build test typecheck lint audit storybook a11y size-check size-analyze build-packages test-coverage

# Run all core checks sequentially/parallel optimally
ci:
	pnpm turbo run lint typecheck test build

ci-coverage:
	pnpm turbo run lint typecheck test:coverage build

install:
	pnpm install --frozen-lockfile

build:
	pnpm turbo run build --continue

build-packages:
	pnpm turbo run build --filter='./packages/*' --continue

test:
	pnpm turbo run test --continue

test-coverage:
	pnpm turbo run test --continue -- --coverage

typecheck:
	pnpm turbo run typecheck --continue

lint:
	pnpm turbo run lint --continue

audit:
	pnpm audit --audit-level high

storybook:
	pnpm turbo run storybook:test --continue

a11y:
	pnpm turbo run a11y --continue

size-check:
	pnpm turbo run size:check --continue

size-analyze:
	pnpm turbo run size:analyze --continue
