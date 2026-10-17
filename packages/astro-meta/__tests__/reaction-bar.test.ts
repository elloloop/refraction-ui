import { describe, it, expect, afterEach, beforeAll, vi } from 'vitest'
import { builtinEnvironments } from 'vitest/environments'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import ReactionBar from '../dist/astro-reaction-bar/ReactionBar.astro'

/**
 * The Astro ReactionBar as consumers install it (the meta's dist copy):
 * server-rendered structure and ARIA, then the client script driven in a
 * jsdom document built from that exact markup. The bar renders in node (the
 * Astro compiler needs it); jsdom is installed only for the browser half.
 */

interface Reaction {
  emoji: string
  count: number
  userReacted: boolean
  label?: string
  reactors?: string[]
}

async function render(props: Record<string, unknown>): Promise<string> {
  const container = await AstroContainer.create()
  return container.renderToString(
    ReactionBar as Parameters<AstroContainer['renderToString']>[0],
    { props },
  )
}

/**
 * The client script as consumers get it. Loaded by path: the meta's copied
 * sources import each other with `.ts` extensions, which only the bundler
 * accepts, so this harness must not pull them into its own typecheck.
 */
const CLIENT_MODULE = '../dist/astro-reaction-bar/reaction-bar-client.js'

interface ReactionBarClient {
  initReactionBars(scope: ParentNode): void
}

function loadClient(): Promise<ReactionBarClient> {
  return import(/* @vite-ignore */ CLIENT_MODULE)
}

let teardown: (() => Promise<void>) | null = null

beforeAll(async () => {
  // Starting jsdom and transforming the client module are slow the first time
  // on a cold run; pay for both once, outside any single test's time budget.
  const env = await builtinEnvironments.jsdom.setup(globalThis, { jsdom: {} })
  await env.teardown(globalThis)
  await loadClient()
}, 60_000)

afterEach(async () => {
  vi.restoreAllMocks()
  await teardown?.()
  teardown = null
})

/** Render the bar, load it into a jsdom document and run its client script. */
async function mount(props: Record<string, unknown>): Promise<HTMLElement> {
  const html = await render(props)
  const env = await builtinEnvironments.jsdom.setup(globalThis, {
    jsdom: { html: `<!doctype html><html><body>${html}</body></html>` },
  })
  teardown = () => Promise.resolve(env.teardown(globalThis))
  const { initReactionBars } = await loadClient()
  initReactionBars(document)
  const bar = document.querySelector<HTMLElement>('[data-rfr-reaction-bar]')
  if (!bar) throw new Error('bar not rendered')
  return bar
}

function pills(bar: HTMLElement): HTMLButtonElement[] {
  return Array.from(bar.querySelectorAll<HTMLButtonElement>('button[aria-pressed]'))
}

function tooltipOf(pill: HTMLElement): HTMLElement {
  const id = pill.getAttribute('aria-describedby')
  const tooltip = id ? document.getElementById(id) : null
  if (!tooltip) throw new Error('pill has no tooltip')
  return tooltip
}

function visible(el: HTMLElement): boolean {
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    if (node.hidden) return false
  }
  return true
}

const AGREE: Reaction = {
  emoji: '\u{1F44D}',
  label: 'Agree',
  count: 5,
  userReacted: true,
  reactors: ['You', 'Dev Patel'],
}
const FOUR: Reaction[] = ['\u{1F44D}', '\u{1F389}', '\u{1F680}', '\u{1F440}'].map((emoji) => ({
  emoji,
  count: 1,
  userReacted: false,
}))

describe('astro-reaction-bar (SSR)', () => {
  it('renders a labelled group of toggle pills', async () => {
    const html = await render({ reactions: FOUR.slice(0, 2) })
    expect(html).toMatch(/<div[^>]*data-rfr-reaction-bar[^>]*role="group"[^>]*aria-label="Reactions"/)
    expect(html).toContain('aria-label="\u{1F44D} 1 reaction"')
    expect(html.split('aria-pressed="false"').length - 1).toBe(2)
    expect(html).toContain('focus-visible:ring-2')
  })

  it('names a labelled reaction and describes it with a hidden who-reacted tooltip', async () => {
    const html = await render({ reactions: [AGREE] })
    expect(html).toContain('aria-label="Agree 5 reactions, you reacted"')
    const describedBy = html.match(/aria-describedby="([^"]+)"/)?.[1]
    expect(describedBy).toBeTruthy()
    expect(html).toMatch(new RegExp(`<span id="${describedBy}" role="tooltip"[^>]*hidden`))
    expect(html).toContain('You, Dev Patel and 3 others reacted with Agree')
  })

  it('folds reactions past maxVisible behind a collapsed "+N" button', async () => {
    const html = await render({ reactions: FOUR, maxVisible: 2 })
    expect(html.split('data-rfr-rb-overflow-item hidden').length - 1).toBe(2)
    expect(html).toMatch(/<button[^>]*aria-expanded="false"[^>]*aria-label="Show 2 more reactions"[^>]*>\s*\+2\s*<\/button>/)
  })

  it('takes custom strings', async () => {
    const html = await render({
      reactions: [AGREE],
      strings: { groupLabel: 'Message reactions', addReaction: 'React' },
    })
    expect(html).toContain('aria-label="Message reactions"')
    expect(html).toContain('aria-label="React"')
  })

  it('hides the add button on request', async () => {
    const html = await render({ reactions: FOUR, showAddButton: false })
    expect(html).not.toContain('data-rfr-rb-add')
  })
})

describe('astro-reaction-bar (client script, jsdom)', () => {
  it('toggling swaps the count, name, look and pressed state, and reports it', async () => {
    const bar = await mount({ reactions: [AGREE] })
    const events: unknown[] = []
    bar.addEventListener('rfr-reaction-toggle', (event) => events.push((event as CustomEvent).detail))
    const [pill] = pills(bar)

    pill.click()
    expect(pill.getAttribute('aria-pressed')).toBe('false')
    expect(pill.getAttribute('aria-label')).toBe('Agree 4 reactions')
    expect(pill.textContent).toContain('4')
    expect(pill.className).toContain('border-border')
    expect(pill.className).not.toContain('border-primary')
    expect(events).toEqual([{ emoji: '\u{1F44D}', userReacted: false, count: 4 }])

    pill.click()
    expect(pill.getAttribute('aria-pressed')).toBe('true')
    expect(pill.getAttribute('aria-label')).toBe('Agree 5 reactions, you reacted')
    expect(pill.className).toContain('border-primary')
  })

  it('a toggle keeps custom strings, resolved on the server', async () => {
    const bar = await mount({
      reactions: [{ emoji: '\u{1F389}', count: 1, userReacted: false }],
      strings: {
        reactionSemantics: (label: string, count: number, mine: boolean) =>
          `${label}: ${count}${mine ? ', including you' : ''}`,
      },
    })
    const [pill] = pills(bar)
    pill.click()
    expect(pill.getAttribute('aria-label')).toBe('\u{1F389}: 2, including you')
  })

  it('the add button reports itself as the anchor, never an emoji', async () => {
    const bar = await mount({ reactions: FOUR.slice(0, 1) })
    const details: unknown[] = []
    bar.addEventListener('rfr-reaction-add', (event) => details.push((event as CustomEvent).detail))
    const add = bar.querySelector<HTMLButtonElement>('[data-rfr-rb-add]')!
    add.click()
    expect(details).toEqual([{ trigger: add }])
  })

  it('the overflow button expands and collapses the bar', async () => {
    const bar = await mount({ reactions: FOUR, maxVisible: 2 })
    const overflow = bar.querySelector<HTMLButtonElement>('[data-rfr-rb-overflow]')!
    expect(pills(bar).filter(visible)).toHaveLength(2)

    overflow.click()
    expect(pills(bar).filter(visible)).toHaveLength(4)
    expect(overflow.getAttribute('aria-expanded')).toBe('true')
    expect(overflow.getAttribute('aria-label')).toBe('Show less')
    expect(overflow.textContent).toBe('Show less')

    overflow.click()
    expect(pills(bar).filter(visible)).toHaveLength(2)
    expect(overflow.getAttribute('aria-label')).toBe('Show 2 more reactions')
    expect(overflow.textContent).toBe('+2')
  })

  it('the tooltip opens on hover and keyboard focus, not on touch', async () => {
    const bar = await mount({ reactions: [AGREE] })
    const [pill] = pills(bar)
    const chip = pill.parentElement!
    const tooltip = tooltipOf(pill)

    chip.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }))
    expect(tooltip.hidden).toBe(false)
    chip.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }))
    expect(tooltip.hidden).toBe(true)

    chip.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'touch' }))
    pill.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true }))
    pill.focus()
    expect(tooltip.hidden).toBe(true)
    pill.blur()

    pill.focus()
    expect(tooltip.hidden).toBe(false)
    pill.blur()
    expect(tooltip.hidden).toBe(true)
  })

  it('Escape closes a focused tooltip before enclosing handlers see it', async () => {
    const bar = await mount({ reactions: [AGREE] })
    const outer: string[] = []
    document.body.addEventListener('keydown', (event) => outer.push(event.key))
    const [pill] = pills(bar)
    pill.focus()

    pill.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(tooltipOf(pill).hidden).toBe(true)
    expect(outer).toEqual([])

    pill.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(outer).toEqual(['Escape'])
  })

  it('Escape closes a hovered tooltip wherever focus is', async () => {
    const bar = await mount({ reactions: [AGREE] })
    const [pill] = pills(bar)
    pill.parentElement!.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }))
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(tooltipOf(pill).hidden).toBe(true)
  })

  it('a tooltip near the far edge of the viewport flips to the pill end', async () => {
    const bar = await mount({ reactions: [AGREE] })
    const [pill] = pills(bar)
    const chip = pill.parentElement!
    // jsdom has no layout: put a 40px pill 300px into a 400px viewport.
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(400)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const tooltip = this.getAttribute('role') === 'tooltip'
      const left = tooltip ? 0 : 300
      const width = tooltip ? 200 : 40
      const rect = { x: left, y: 0, left, top: 0, width, height: 24, right: left + width, bottom: 24 }
      return { ...rect, toJSON: () => rect } as DOMRect
    })

    chip.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }))
    expect(tooltipOf(pill).dataset.align).toBe('end')
  })

  it('wires a bar once however often the script runs', async () => {
    const bar = await mount({ reactions: [AGREE] })
    const { initReactionBars } = await loadClient()
    initReactionBars(document)
    const events: unknown[] = []
    bar.addEventListener('rfr-reaction-toggle', (event) => events.push(event))
    pills(bar)[0].click()
    expect(events).toHaveLength(1)
  })
})
