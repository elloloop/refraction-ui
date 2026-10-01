// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MarkdownRenderer } from '../src/MarkdownRenderer.js'
let root: Root | undefined
let container: HTMLDivElement
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
afterEach(async () => {
  if (root) await act(async () => root!.unmount())
  container?.remove()
})
it('keeps private messages native by default and restores canonical text when artwork is disabled', async () => {
  container = document.createElement('div'); document.body.append(container)
  root = createRoot(container)
  const ref = { current: null as HTMLDivElement | null }
  const content = 'Private **🔥** · `code 🔥`'
  await act(async () => root!.render(createElement(MarkdownRenderer, { content, ref })))
  expect(ref.current).toBe(container.firstElementChild)
  expect(container.querySelector('img')).toBeNull()
  expect(container.textContent).toBe('Private 🔥 · code 🔥')
  await act(async () => root!.render(createElement(MarkdownRenderer, { content, ref, emojiArtwork: true, twemojiBaseUrl: '/private-emoji' })))
  const image = container.querySelector('img')!
  expect(image.getAttribute('src')).toBe('/private-emoji/1f525.svg')
  expect(image.getAttribute('referrerpolicy')).toBe('no-referrer')
  expect(container.querySelector('code img')).toBeNull()
  await act(async () => root!.render(createElement(MarkdownRenderer, { content, ref })))
  expect(container.querySelector('img')).toBeNull()
  expect(container.textContent).toBe('Private 🔥 · code 🔥')
})
