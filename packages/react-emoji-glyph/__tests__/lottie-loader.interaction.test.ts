// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest'
import { createLottieEmojiGlyphLoader, type EmojiGlyphLottiePlayer } from '../src/index.js'

const URL_A = '/emoji-animated/1f44d.json'
const ANIMATION = JSON.stringify({ v: '5.8.1', layers: [] })

function fakePlayer() {
  const destroy = vi.fn()
  const loadAnimation = vi.fn<EmojiGlyphLottiePlayer['loadAnimation']>(() => ({ destroy }))
  return { player: { loadAnimation }, loadAnimation, destroy }
}

function request(signal = new AbortController().signal) {
  return { url: URL_A, container: document.createElement('span'), signal }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createLottieEmojiGlyphLoader', () => {
  it('imports the player only when the first animation is requested', async () => {
    const { player } = fakePlayer()
    const importPlayer = vi.fn(async () => player)
    const load = createLottieEmojiGlyphLoader({ fetchText: async () => ANIMATION, importPlayer })
    expect(importPlayer).not.toHaveBeenCalled()
    await load(request())
    expect(importPlayer).toHaveBeenCalledTimes(1)
  })

  it('plays looping SVG Lottie into the given container', async () => {
    const { player, loadAnimation } = fakePlayer()
    const load = createLottieEmojiGlyphLoader({ fetchText: async () => ANIMATION, importPlayer: async () => player })
    const req = request()
    await load(req)
    expect(loadAnimation).toHaveBeenCalledWith({
      container: req.container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: JSON.parse(ANIMATION),
    })
  })

  it('fetches each file once and gives every glyph its own parsed copy', async () => {
    const { player, loadAnimation } = fakePlayer()
    const fetchText = vi.fn(async () => ANIMATION)
    const load = createLottieEmojiGlyphLoader({ fetchText, importPlayer: async () => player })
    await Promise.all([load(request()), load(request())])
    expect(fetchText).toHaveBeenCalledTimes(1)
    const [first, second] = loadAnimation.mock.calls.map(([params]) => params.animationData)
    expect(first).toEqual(second)
    expect(first).not.toBe(second)
  })

  it('forgets a failed fetch so a later glyph retries it', async () => {
    const { player } = fakePlayer()
    const fetchText = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(ANIMATION)
    const load = createLottieEmojiGlyphLoader({ fetchText, importPlayer: async () => player })
    await expect(load(request())).rejects.toThrow('offline')
    await expect(load(request())).resolves.toBeDefined()
    expect(fetchText).toHaveBeenCalledTimes(2)
  })

  it('rejects invalid JSON instead of playing it', async () => {
    const { player, loadAnimation } = fakePlayer()
    const load = createLottieEmojiGlyphLoader({ fetchText: async () => '<html>', importPlayer: async () => player })
    await expect(load(request())).rejects.toThrow(SyntaxError)
    expect(loadAnimation).not.toHaveBeenCalled()
  })

  it('does nothing for an already-aborted request', async () => {
    const fetchText = vi.fn(async () => ANIMATION)
    const load = createLottieEmojiGlyphLoader({ fetchText, importPlayer: async () => fakePlayer().player })
    const controller = new AbortController()
    controller.abort()
    await expect(load(request(controller.signal))).rejects.toMatchObject({ name: 'AbortError' })
    expect(fetchText).not.toHaveBeenCalled()
  })

  it('does not start the player when aborted while loading', async () => {
    const { player, loadAnimation } = fakePlayer()
    const load = createLottieEmojiGlyphLoader({ fetchText: async () => ANIMATION, importPlayer: async () => player })
    const controller = new AbortController()
    const pending = load(request(controller.signal))
    controller.abort()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    expect(loadAnimation).not.toHaveBeenCalled()
  })

  it('destroys the player animation through the handle', async () => {
    const { player, destroy } = fakePlayer()
    const load = createLottieEmojiGlyphLoader({ fetchText: async () => ANIMATION, importPlayer: async () => player })
    const handle = await load(request())
    handle.destroy()
    expect(destroy).toHaveBeenCalledTimes(1)
  })

  it('fetches without credentials or referrer, and rejects HTTP errors', async () => {
    const fetchStub = vi.fn()
      .mockResolvedValueOnce(new Response(ANIMATION, { status: 200 }))
      .mockResolvedValueOnce(new Response('missing', { status: 404 }))
    vi.stubGlobal('fetch', fetchStub)
    const { player } = fakePlayer()
    const load = createLottieEmojiGlyphLoader({ importPlayer: async () => player })

    await load(request())
    expect(fetchStub).toHaveBeenCalledWith(URL_A, { credentials: 'omit', referrerPolicy: 'no-referrer' })

    const other = { ...request(), url: '/emoji-animated/2764.json' }
    await expect(load(other)).rejects.toThrow('/emoji-animated/2764.json answered HTTP 404')
  })
})
