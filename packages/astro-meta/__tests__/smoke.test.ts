import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import {
  DEFAULT_MARKER_RE,
  SLOT_SENTINEL,
  discoverPrimaries,
} from './harness'
import {
  COMPONENT_OVERRIDES,
  EXPECT_SLOT_CONTENT,
  PLACEHOLDERS,
  PROPS,
} from './fixtures'

/**
 * Smoke coverage for every Astro adapter, rendered exactly as consumers get
 * it: the meta's copied `dist/<pkg>/*.astro` sources compiled by the Astro
 * vite plugin and rendered SSR-side via the Container API.
 *
 * Per primary component the suite asserts:
 *   1. it renders without throwing (catches core-API drift, bad rewrites),
 *   2. the HTML is non-trivial and carries an expected hook (data-rfr-* /
 *      role / class / semantic root — see DEFAULT_MARKER_RE),
 *   3. components whose contract includes a default slot actually render the
 *      slot content (fixture table `EXPECT_SLOT_CONTENT`).
 *
 * Intentional placeholders (`PLACEHOLDERS`) can only be asserted to render.
 */

const primaries = discoverPrimaries(COMPONENT_OVERRIDES)

describe('astro adapter smoke (meta dist, container API)', () => {
  it('discovers a primary component for (almost) every adapter package', () => {
    // 125 astro-* packages ship at least one .astro primary component.
    expect(primaries.length).toBeGreaterThanOrEqual(120)
  })

  for (const { pkg, file } of primaries) {
    it(`${pkg}: renders ${file} with minimal props`, async () => {
      const mod = await import(`../dist/${pkg}/${file}`)
      const container = await AstroContainer.create()
      const html = await container.renderToString(mod.default, {
        props: PROPS[pkg],
        slots: { default: SLOT_SENTINEL },
      })

      expect(typeof html).toBe('string')

      if (PLACEHOLDERS.has(pkg)) {
        // Placeholder component — rendering without throwing is the contract.
        return
      }

      expect(html.trim().length).toBeGreaterThan(0)
      expect(html).toContain('<')
      expect(html).toMatch(DEFAULT_MARKER_RE)

      if (EXPECT_SLOT_CONTENT.has(pkg)) {
        expect(html).toContain(SLOT_SENTINEL)
      }
    })
  }
})
