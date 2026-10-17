// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Composer } from '../src/composer.js'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

// Text sized in rem follows the reader's browser text-size setting; a pixel
// size would stay fixed.
const PIXEL_TEXT = /\btext-\[\d+(?:\.\d+)?px\]/

let root: Root | undefined

afterEach(async () => {
  if (root) await act(async () => { root!.unmount() })
  root = undefined
  document.body.replaceChildren()
})

/** Types into the textarea the way a browser does, so React's onChange fires. */
function typeInto(textarea: HTMLTextAreaElement, text: string) {
  const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!
  setValue.call(textarea, text)
  textarea.setSelectionRange(text.length, text.length)
  textarea.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('Composer trigger menu text size (jsdom)', () => {
  it('sizes the menu heading in rem', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
    await act(async () => {
      root!.render(
        <Composer onSubmit={() => {}} slashCommands={[{ id: 'shrug', label: 'Shrug', insertText: '¯\\_(ツ)_/¯' }]} />,
      )
    })

    const textarea = document.querySelector<HTMLTextAreaElement>('textarea[aria-label="Message"]')!
    await act(async () => { typeInto(textarea, '/') })

    const menu = document.querySelector<HTMLElement>('[role="listbox"]')
    expect(menu).not.toBeNull()
    const heading = menu!.firstElementChild as HTMLElement
    expect(heading.textContent).toBe('Commands')
    expect(heading.className).not.toMatch(PIXEL_TEXT)
    expect(heading.className.split(/\s+/)).toContain('text-[0.625rem]')
  })
})
