import { describe, it, expect, beforeAll } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import FloatingReactions from '../dist/astro-floating-reactions/FloatingReactions.astro'

/**
 * The Astro FloatingReactions as consumers install it (the meta's dist copy):
 * the overlay ships its own motion, exactly the core's stylesheet, and marks
 * each reaction so that stylesheet animates it.
 */

async function render(props: Record<string, unknown>): Promise<string> {
  const container = await AstroContainer.create()
  return container.renderToString(
    FloatingReactions as Parameters<AstroContainer['renderToString']>[0],
    { props },
  )
}

const styleTag = /<style[^>]*>([\s\S]*?)<\/style>/g

/**
 * The core as the meta ships it. Loaded by path: the meta's copied sources
 * import each other with `.ts` extensions, which only the bundler accepts,
 * so this test must not pull them into its own typecheck.
 */
const CORE_MODULE = '../dist/floating-reactions/index.ts'
let floatingReactionsStyles = ''

beforeAll(async () => {
  const core = (await import(/* @vite-ignore */ CORE_MODULE)) as { floatingReactionsStyles: string }
  floatingReactionsStyles = core.floatingReactionsStyles
})

describe('FloatingReactions (Astro) motion', () => {
  it('renders the library stylesheet verbatim, so no global CSS is needed', async () => {
    const html = await render({ reactions: [] })
    const sheets = [...html.matchAll(styleTag)]
    expect(floatingReactionsStyles).toContain('@keyframes')
    expect(sheets).toHaveLength(1)
    expect(sheets[0][1]).toBe(floatingReactionsStyles)
  })

  it('marks every reaction so the stylesheet animates it', async () => {
    const html = await render({
      reactions: [
        { id: 'a', emoji: '👋', lane: 0 },
        { id: 'b', emoji: '🎉', lane: 3 },
      ],
    })
    expect(html.match(/data-floating-reaction[\s>=]/g) ?? []).toHaveLength(2)
    expect(html).toContain('left:10%')
    expect(html).toContain('left:70%')
  })

  it('keeps the overlay a polite live region', async () => {
    const html = await render({ reactions: [] })
    expect(html).toContain('role="status"')
    expect(html).toContain('aria-live="polite"')
  })
})
