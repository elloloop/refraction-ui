// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { renderToString } from 'react-dom/server'
import { createRoot, hydrateRoot, type Root } from 'react-dom/client'
import { AvatarGroup } from '../src/avatar-group.js'
import type { AvatarUser } from '@refraction-ui/avatar-group'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

let container: HTMLDivElement
let root: Root | undefined
// jsdom does not fetch images. Model where the browser got to with each src:
// absent = still loading, 0 = failed, >0 = loaded (its natural width).
const settled = new Map<string, number>()

beforeEach(() => {
  settled.clear()
  container = document.createElement('div')
  document.body.appendChild(container)
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
})

afterEach(async () => {
  if (root) await act(async () => root?.unmount())
  root = undefined
  container.remove()
  vi.restoreAllMocks()
})

const ADA: AvatarUser = { id: '1', name: 'Ada Lovelace', src: '/ada.png', status: 'online' }
const GRACE: AvatarUser = { id: '2', name: 'Grace Hopper', src: '/grace.png' }
const TEAM: AvatarUser[] = [
  ADA,
  GRACE,
  { id: '3', name: 'Alan Turing' },
  { id: '4', name: 'Edsger Dijkstra' },
]

/** Server-render, then hydrate, failing on any hydration complaint. */
async function hydrate(ui: React.ReactElement) {
  container.innerHTML = renderToString(ui)
  const recoverable: unknown[] = []
  const consoleError = vi.spyOn(console, 'error')
  await act(async () => {
    root = hydrateRoot(container, ui, { onRecoverableError: (error) => recoverable.push(error) })
  })
  expect(recoverable).toEqual([])
  expect(consoleError).not.toHaveBeenCalled()
}

async function render(ui: React.ReactElement) {
  root = createRoot(container)
  await act(async () => root!.render(ui))
}

function avatar(name: string): HTMLElement {
  const el = container.querySelector<HTMLElement>(`[role="img"][aria-label^="${name}"]`)
  if (!el) throw new Error(`no avatar for ${name}`)
  return el
}

describe('AvatarGroup photos (React, jsdom)', () => {
  it('hydrates two groups with matching ids and no hydration errors', async () => {
    await hydrate(
      <React.StrictMode>
        <AvatarGroup users={TEAM} max={2} />
        <AvatarGroup users={TEAM} max={3} />
      </React.StrictMode>,
    )
    const ids = Array.from(container.querySelectorAll('[role="group"]'), (group) => group.id)
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
  })

  it('a photo that failed before hydration is removed and the initials stay', async () => {
    settled.set('/ada.png', 0)
    await hydrate(<AvatarGroup users={[ADA]} />)
    expect(avatar('Ada').querySelector('img')).toBeNull()
    expect(avatar('Ada').textContent).toBe('AL')
  })

  it('a photo that loaded before hydration replaces the initials', async () => {
    settled.set('/ada.png', 150)
    await hydrate(<AvatarGroup users={[ADA]} />)
    expect(avatar('Ada').querySelector('img')?.getAttribute('src')).toBe('/ada.png')
    expect(avatar('Ada').textContent).toBe('')
  })

  it('the initials show while a photo loads, and go when it loads', async () => {
    await render(<AvatarGroup users={[ADA]} />)
    const image = avatar('Ada').querySelector('img')!
    expect(avatar('Ada').textContent).toBe('AL')

    settled.set('/ada.png', 150)
    await act(async () => image.dispatchEvent(new Event('load')))
    expect(avatar('Ada').textContent).toBe('')
    expect(avatar('Ada').querySelector('img')).toBe(image)
  })

  it('a photo that fails later is removed and the initials stay', async () => {
    await render(<AvatarGroup users={[ADA]} />)
    const image = avatar('Ada').querySelector('img')!

    settled.set('/ada.png', 0)
    await act(async () => image.dispatchEvent(new Event('error')))
    expect(avatar('Ada').querySelector('img')).toBeNull()
    expect(avatar('Ada').textContent).toBe('AL')
  })

  it('a new src gets its own chance after the old one failed', async () => {
    settled.set('/ada.png', 0)
    await render(<AvatarGroup users={[ADA]} />)
    expect(avatar('Ada').querySelector('img')).toBeNull()

    await act(async () => root!.render(<AvatarGroup users={[{ ...ADA, src: '/ada-2.png' }]} />))
    expect(avatar('Ada').querySelector('img')?.getAttribute('src')).toBe('/ada-2.png')
    expect(avatar('Ada').textContent).toBe('AL')
  })

  it('one failed photo leaves the others alone', async () => {
    settled.set('/ada.png', 0)
    settled.set('/grace.png', 150)
    await hydrate(<AvatarGroup users={[ADA, GRACE]} />)
    expect(avatar('Ada').querySelector('img')).toBeNull()
    expect(avatar('Grace').querySelector('img')).not.toBeNull()
    expect(avatar('Grace').textContent).toBe('')
  })

  it('keeps the presence dot whatever happens to the photo', async () => {
    settled.set('/ada.png', 0)
    await hydrate(<AvatarGroup users={[ADA]} />)
    expect(avatar('Ada').querySelector('.bg-success')).not.toBeNull()
  })
})

describe('AvatarGroup overflow button (React, jsdom)', () => {
  it('is focusable and calls onOverflowClick with itself', async () => {
    const onOverflowClick = vi.fn()
    await render(<AvatarGroup users={TEAM} max={2} onOverflowClick={onOverflowClick} />)
    const button = container.querySelector('button')!
    expect(button.getAttribute('aria-label')).toBe('2 more users')

    button.focus()
    expect(document.activeElement).toBe(button)
    await act(async () => button.click())
    expect(onOverflowClick).toHaveBeenCalledTimes(1)
    expect(onOverflowClick).toHaveBeenCalledWith(button)
  })

  it('without onOverflowClick nothing in the group takes focus', async () => {
    await render(<AvatarGroup users={TEAM} max={2} />)
    expect(container.querySelector('button, [tabindex]')).toBeNull()
  })
})
