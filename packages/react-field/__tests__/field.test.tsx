import { describe, it, expect, vi, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { Field, type FieldProps } from '../src/index.js'

const render = (props: FieldProps) => renderToString(React.createElement(Field, props))

/** The value of `attr` on the first tag matching `tag`. */
function attr(html: string, tag: string, name: string): string | undefined {
  const open = html.match(new RegExp(`<${tag}\\b[^>]*>`))?.[0]
  return open?.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1]
}

afterEach(() => {
  vi.restoreAllMocks()
  resetDevFeedback()
})

describe('Field (SSR)', () => {
  it('names its control by a generated id', () => {
    const html = render({ label: 'Email', children: <input /> })
    const id = attr(html, 'input', 'id')
    expect(id).toBeTruthy()
    expect(attr(html, 'label', 'for')).toBe(id)
    expect(html).toContain('data-slot="field"')
    expect(html).toContain('data-layout="stacked"')
  })

  it('keeps an id the control already has', () => {
    const html = render({ label: 'Name', children: <input id="own" /> })
    expect(attr(html, 'input', 'id')).toBe('own')
    expect(attr(html, 'label', 'for')).toBe('own')
  })

  it('names a direct control by htmlFor when the ids agree', () => {
    const html = render({
      label: 'Scope',
      htmlFor: 'scope',
      hint: 'Who can see it.',
      children: (
        <select id="scope">
          <option>a</option>
        </select>
      ),
    })
    expect(attr(html, 'label', 'for')).toBe('scope')
    expect(attr(html, 'select', 'aria-describedby')).toBe('scope-hint')
  })

  it('describes the control with the hint, outside its name', () => {
    const html = render({
      label: 'Password',
      hint: 'At least 12 characters.',
      children: <input type="password" />,
    })
    const id = attr(html, 'input', 'id')
    expect(attr(html, 'input', 'aria-describedby')).toBe(`${id}-hint`)
    expect(attr(html, 'p', 'id')).toBe(`${id}-hint`)
    expect(html).toMatch(/<label[^>]*>Password<\/label>/)
    expect(html).toContain('At least 12 characters.')
  })

  it('keeps an existing aria-describedby and appends the hint', () => {
    const html = render({
      label: 'Code',
      hint: 'Six digits.',
      children: <input id="code" aria-describedby="code-error" />,
    })
    expect(attr(html, 'input', 'aria-describedby')).toBe('code-error code-hint')
  })

  it('renders no hint and no aria-describedby without a hint', () => {
    const html = render({ label: 'Email', children: <input /> })
    expect(html).not.toContain('aria-describedby')
    expect(html).not.toContain('data-slot="field-hint"')
  })

  it('leaves a wrapped control untouched when htmlFor names it', () => {
    const html = render({
      label: 'Password',
      htmlFor: 'pw',
      hint: 'Use a passphrase.',
      children: (
        <span>
          <input id="pw" type="password" aria-describedby="pw-hint" />
          <button type="button">Show</button>
        </span>
      ),
    })
    // The wrapper does not get the control's id (no duplicate ids).
    expect(html.match(/id="pw"/g)).toHaveLength(1)
    expect(attr(html, 'span', 'id')).toBeUndefined()
    expect(attr(html, 'label', 'for')).toBe('pw')
    expect(attr(html, 'p', 'id')).toBe('pw-hint')
  })

  it('hands a render-function child the id and description to spread', () => {
    const html = render({
      label: 'Password',
      hint: 'Use a passphrase.',
      children: (control) => (
        <span>
          <input type="password" {...control} />
          <button type="button">Show</button>
        </span>
      ),
    })
    const id = attr(html, 'input', 'id')
    expect(id).toBeTruthy()
    expect(attr(html, 'label', 'for')).toBe(id)
    expect(attr(html, 'input', 'aria-describedby')).toBe(`${id}-hint`)
    expect(attr(html, 'p', 'id')).toBe(`${id}-hint`)
  })

  it('puts the label after the control in the inline layout', () => {
    const html = render({
      label: 'Show archived',
      layout: 'inline',
      hint: 'Includes closed items.',
      children: <input type="checkbox" />,
    })
    expect(html).toContain('data-layout="inline"')
    expect(html.indexOf('<input')).toBeLessThan(html.indexOf('<label'))
    expect(html.indexOf('<label')).toBeLessThan(html.indexOf('<p'))
    expect(attr(html, 'p', 'class')).toContain('col-start-2')
  })

  it('puts the label before the control in the stacked layout', () => {
    const html = render({ label: 'Email', children: <input /> })
    expect(html.indexOf('<label')).toBeLessThan(html.indexOf('<input'))
  })

  it('applies the eyebrow label and grow classes', () => {
    const html = render({
      label: 'Status',
      labelTone: 'eyebrow',
      grow: true,
      children: <input />,
    })
    expect(attr(html, 'label', 'class')).toContain('uppercase')
    expect(attr(html, 'div', 'class')).toContain('flex-1')
  })

  it('merges className and passes other attributes to the root', () => {
    const html = render({
      label: 'L',
      className: 'extra',
      'data-testid': 'field-root',
      children: <input />,
    } as FieldProps)
    expect(attr(html, 'div', 'class')).toContain('extra')
    expect(attr(html, 'div', 'data-testid')).toBe('field-root')
  })

  it('does not put an id on a fragment child', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const html = render({
      label: 'Range',
      children: (
        <>
          <input aria-label="From" />
          <input aria-label="To" />
        </>
      ),
    })
    expect(html).not.toContain('id=')
    expect(attr(html, 'label', 'for')).toBeUndefined()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0]?.join(' '))).toContain('Field could not find the control')
  })
})
