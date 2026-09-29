// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { renderToString } from 'react-dom/server'
import { hydrateRoot, type Root } from 'react-dom/client'
import { Avatar, AvatarImage, AvatarFallback } from '../src/avatar.js'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

let container: HTMLDivElement
let root: Root | undefined
// jsdom does not fetch images. Model the browser's already-settled native
// properties; the separate Chromium reproduction exercises actual HTTP images.
const completed = new Map<string, number>()

beforeEach(() => {
  completed.clear()
  container = document.createElement('div')
  document.body.appendChild(container)
  vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockImplementation(function () {
    return completed.has(this.getAttribute('src') ?? '')
  })
  vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockImplementation(function () {
    return completed.get(this.getAttribute('src') ?? '') ?? 0
  })
})

afterEach(async () => {
  if (root) await act(async () => root?.unmount())
  root = undefined
  container.remove()
  vi.restoreAllMocks()
})

function example(src: string, ref: React.Ref<HTMLImageElement>, onLoad = vi.fn(), onError = vi.fn()) {
  return <React.StrictMode><Avatar>
    <AvatarImage src={src} alt="Person" ref={ref} onLoad={onLoad} onError={onError} />
    <AvatarFallback data-testid="fallback">JD</AvatarFallback>
  </Avatar></React.StrictMode>
}

async function hydrate(ui: React.ReactElement) {
  container.innerHTML = renderToString(ui)
  const serverImage = container.querySelector('img')!
  const recoverable: unknown[] = []
  await act(async () => {
    root = hydrateRoot(container, ui, { onRecoverableError: error => recoverable.push(error) })
  })
  expect(recoverable).toEqual([])
  return serverImage
}

it('removes an image that failed before hydration without replaying its error event', async () => {
  completed.set('/missing.png', 0)
  const onError = vi.fn()
  const cleanup = vi.fn()
  const ref = vi.fn((node: HTMLImageElement | null) => node ? cleanup : undefined)
  await hydrate(example('/missing.png', ref, vi.fn(), onError))
  expect(container.querySelector('img')).toBeNull()
  expect(container.querySelector('[data-testid="fallback"]')?.textContent).toBe('JD')
  expect(onError).not.toHaveBeenCalled()
  expect(ref.mock.calls.some(([node]) => node instanceof HTMLImageElement)).toBe(true)
  expect(cleanup).toHaveBeenCalled()
})

it('recognizes a loaded image before hydration and preserves its forwarded object ref', async () => {
  completed.set('/loaded.png', 48)
  const ref = React.createRef<HTMLImageElement>()
  const onLoad = vi.fn()
  const serverImage = await hydrate(example('/loaded.png', ref, onLoad))
  expect(container.querySelector('img')).toBe(serverImage)
  expect(ref.current).toBe(serverImage)
  expect(container.querySelector('[data-testid="fallback"]')).toBeNull()
  expect(onLoad).not.toHaveBeenCalled()
})

it('recovers after a cached failure and preserves later load/error callbacks and ref cleanup', async () => {
  completed.set('/missing.png', 0)
  const ref = React.createRef<HTMLImageElement>()
  const onLoad = vi.fn()
  const onError = vi.fn()
  await hydrate(example('/missing.png', ref, onLoad, onError))
  expect(ref.current).toBeNull()

  await act(async () => root?.render(example('/next.png', ref, onLoad, onError)))
  const image = container.querySelector('img')!
  expect(image.getAttribute('src')).toBe('/next.png')
  expect(ref.current).toBe(image)
  expect(container.querySelector('[data-testid="fallback"]')?.textContent).toBe('JD')
  completed.set('/next.png', 48)
  await act(async () => image.dispatchEvent(new Event('load')))
  expect(onLoad).toHaveBeenCalledTimes(1)
  expect(container.querySelector('[data-testid="fallback"]')).toBeNull()

  await act(async () => root?.render(example('/later-failure.png', ref, onLoad, onError)))
  completed.set('/later-failure.png', 0)
  await act(async () => image.dispatchEvent(new Event('error')))
  expect(onError).toHaveBeenCalledTimes(1)
  expect(container.querySelector('img')).toBeNull()
  expect(ref.current).toBeNull()
  expect(container.querySelector('[data-testid="fallback"]')?.textContent).toBe('JD')
})
