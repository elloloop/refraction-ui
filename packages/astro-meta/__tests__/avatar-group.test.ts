import { describe, it, expect, afterEach, beforeAll, vi } from 'vitest'
import { builtinEnvironments } from 'vitest/environments'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import AvatarGroup from '../dist/astro-avatar-group/AvatarGroup.astro'

/**
 * The Astro AvatarGroup as consumers install it (the meta's dist copy):
 * server-rendered structure and ARIA, then its client script driven in a
 * jsdom document built from that exact markup.
 */

async function render(props: Record<string, unknown>): Promise<string> {
  const container = await AstroContainer.create()
  return container.renderToString(
    AvatarGroup as Parameters<AstroContainer['renderToString']>[0],
    { props },
  )
}

/**
 * Loaded by path: the meta's copied sources import each other with `.ts`
 * extensions, which only the bundler accepts, so this harness must not pull
 * them into its own typecheck.
 */
const CLIENT_MODULE = '../dist/astro-avatar-group/avatar-group-client.js'
const META_MODULE = '../dist/index.ts'

interface AvatarGroupClient {
  initAvatarGroups(scope: ParentNode): void
}

function loadClient(): Promise<AvatarGroupClient> {
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

const ADA = { id: '1', name: 'Ada Lovelace', src: '/ada.png', status: 'online' }
const GRACE = { id: '2', name: 'Grace Hopper', src: '/grace.png' }
const TEAM = [ADA, GRACE, { id: '3', name: 'Alan Turing' }, { id: '4', name: 'Edsger Dijkstra' }]

/**
 * Render the group into a jsdom document, model where each image got to
 * (absent = loading, 0 = failed, >0 = loaded) and run the client script.
 */
async function mount(
  props: Record<string, unknown>,
  settled: Map<string, number>,
): Promise<HTMLElement> {
  const html = await render(props)
  const env = await builtinEnvironments.jsdom.setup(globalThis, {
    jsdom: { html: `<!doctype html><html><body>${html}</body></html>` },
  })
  teardown = () => Promise.resolve(env.teardown(globalThis))
  vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockImplementation(function (
    this: HTMLImageElement,
  ) {
    return settled.has(this.getAttribute('src') ?? '')
  })
  vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockImplementation(function (
    this: HTMLImageElement,
  ) {
    return settled.get(this.getAttribute('src') ?? '') ?? 0
  })
  const { initAvatarGroups } = await loadClient()
  initAvatarGroups(document)
  const group = document.querySelector<HTMLElement>('[role="group"]')
  if (!group) throw new Error('group not rendered')
  return group
}

function avatar(group: HTMLElement, name: string): HTMLElement {
  const el = group.querySelector<HTMLElement>(`[role="img"][aria-label^="${name}"]`)
  if (!el) throw new Error(`no avatar for ${name}`)
  return el
}

describe('astro-avatar-group (public meta)', () => {
  it('is exported from @refraction-ui/astro', async () => {
    const meta = (await import(/* @vite-ignore */ META_MODULE)) as Record<string, unknown>
    expect(meta.AvatarGroup).toBe(AvatarGroup)
  }, 60_000)
})

describe('astro-avatar-group (SSR)', () => {
  it('renders named avatars, each photo over its initials as decoration', async () => {
    const html = await render({ users: TEAM, max: 2 })
    expect(html).toMatch(/<div[^>]*role="group"[^>]*aria-label="4 users"/)
    expect(html).toContain('aria-label="Ada Lovelace (online)"')
    expect(html).toMatch(/data-rfr-avatar-group-initials[^>]*>\s*AL\s*<\/span>\s*<img src="\/ada.png" alt=""/)
  })

  it('does not clip an avatar, and puts the dot over the bottom end corner', async () => {
    const html = await render({ users: [ADA] })
    const avatarClass = html.match(/<div class="([^"]*)" role="img"/)?.[1]
    expect(avatarClass?.split(' ')).not.toContain('overflow-hidden')
    expect(html).toMatch(/<span class="[^"]*absolute bottom-0 end-0 z-10[^"]*bg-success/)
  })

  it('the "+N" badge is a label by default, never an inert button', async () => {
    const html = await render({ users: TEAM, max: 2 })
    expect(html).toMatch(/<div class="[^"]*" role="img" aria-label="2 more users">\s*\+2\s*<\/div>/)
    expect(html).not.toContain('role="button"')
    expect(html).not.toContain('<button')
  })

  it('overflowButton makes the badge a real button with a focus ring', async () => {
    const html = await render({ users: TEAM, max: 2, overflowButton: true })
    const button = html.match(/<button[^>]*>\s*\+2\s*<\/button>/)?.[0]
    expect(button).toBeDefined()
    expect(button).toContain('data-rfr-avatar-group-overflow')
    expect(button).toContain('type="button"')
    expect(button).toContain('aria-label="2 more users"')
    expect(button).toContain('focus-visible:ring-ring')
  })
})

describe('astro-avatar-group (client script, jsdom)', () => {
  it('removes a photo that failed before the script ran; the initials stay', async () => {
    const group = await mount({ users: [ADA] }, new Map([['/ada.png', 0]]))
    expect(avatar(group, 'Ada').querySelector('img')).toBeNull()
    expect(avatar(group, 'Ada').textContent?.trim()).toBe('AL')
  })

  it('drops the initials under a photo that already loaded', async () => {
    const group = await mount({ users: [ADA] }, new Map([['/ada.png', 150]]))
    expect(avatar(group, 'Ada').querySelector('img')).not.toBeNull()
    expect(avatar(group, 'Ada').querySelector('[data-rfr-avatar-group-initials]')).toBeNull()
  })

  it('settles a photo that loads or fails later', async () => {
    const settled = new Map<string, number>()
    const group = await mount({ users: [ADA, GRACE] }, settled)
    const ada = avatar(group, 'Ada').querySelector('img')!
    const grace = avatar(group, 'Grace').querySelector('img')!
    expect(avatar(group, 'Ada').textContent?.trim()).toBe('AL')

    settled.set('/ada.png', 0)
    ada.dispatchEvent(new Event('error'))
    settled.set('/grace.png', 150)
    grace.dispatchEvent(new Event('load'))

    expect(avatar(group, 'Ada').querySelector('img')).toBeNull()
    expect(avatar(group, 'Ada').textContent?.trim()).toBe('AL')
    expect(avatar(group, 'Grace').querySelector('img')).toBe(grace)
    expect(avatar(group, 'Grace').querySelector('[data-rfr-avatar-group-initials]')).toBeNull()
  })

  it('wires a photo once however often the script runs', async () => {
    const settled = new Map<string, number>()
    const group = await mount({ users: [ADA] }, settled)
    const { initAvatarGroups } = await loadClient()
    initAvatarGroups(document)
    const image = avatar(group, 'Ada').querySelector('img')!
    const removed = vi.spyOn(image, 'remove')
    settled.set('/ada.png', 0)
    image.dispatchEvent(new Event('error'))
    expect(removed).toHaveBeenCalledTimes(1)
  })
})
