.PHONY: ci install build test typecheck lint

# Run all CI checks in parallel optimally using Turborepo
ci:
	pnpm turbo run lint typecheck test build

install:
	pnpm install

build:
	pnpm turbo run build

test:
	pnpm turbo run test

typecheck:
	pnpm turbo run typecheck

lint:
	pnpm turbo run lint
