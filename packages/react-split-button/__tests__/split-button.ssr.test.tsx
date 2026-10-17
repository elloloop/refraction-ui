import { describe, it, expect, vi, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { DropdownMenuItem } from '@refraction-ui/react-dropdown-menu'
import {
  SplitButton,
  SplitButtonAction,
  SplitButtonTrigger,
  SplitButtonMenu,
  SPLIT_BUTTON_DEFAULT_MENU_LABEL,
  type SplitButtonProps,
  type SplitButtonTriggerProps,
} from '../src/index.js'

afterEach(() => {
  vi.restoreAllMocks()
})

function render(
  props: Partial<SplitButtonProps> = {},
  options: { trigger?: Partial<SplitButtonTriggerProps>; actionDisabled?: boolean } = {},
) {
  return renderToString(
    <SplitButton {...props}>
      <SplitButtonAction disabled={options.actionDisabled}>Save</SplitButtonAction>
      <SplitButtonTrigger {...options.trigger} />
      <SplitButtonMenu>
        <DropdownMenuItem>Save as draft</DropdownMenuItem>
      </SplitButtonMenu>
    </SplitButton>,
  )
}

/** The opening tag of each `<button>`, in document order: [action, caret]. */
function buttons(html: string): string[] {
  return html.match(/<button[^>]*>/g) ?? []
}

function classList(tag: string): string[] {
  return (/class="([^"]*)"/.exec(tag)?.[1] ?? '').split(/\s+/)
}

describe('SplitButton (SSR)', () => {
  it('renders two real buttons inside a group', () => {
    const html = render()
    expect(html).toMatch(/^<div[^>]*role="group"/)
    const [action, caret] = buttons(html)
    expect(buttons(html)).toHaveLength(2)
    expect(action).toContain('type="button"')
    expect(caret).toContain('type="button"')
    expect(html).toContain('Save</button>')
  })

  it('names the caret "More options" by default', () => {
    expect(SPLIT_BUTTON_DEFAULT_MENU_LABEL).toBe('More options')
    expect(buttons(render())[1]).toContain('aria-label="More options"')
  })

  it('names the caret with a caller-supplied label', () => {
    const caret = buttons(render({}, { trigger: { label: 'Export options' } }))[1]
    expect(caret).toContain('aria-label="Export options"')
  })

  it('makes the caret a menu button for DropdownMenu', () => {
    const caret = buttons(render())[1]
    expect(caret).toContain('aria-haspopup="menu"')
    expect(caret).toContain('aria-expanded="false"')
    expect(caret).toMatch(/aria-controls="rfr-dropdown-menu-[^"]+"/)
  })

  it('hides the default chevron from assistive tech, and lets children replace it', () => {
    expect(render()).toMatch(/<svg aria-hidden="true" class="pointer-events-none h-4 w-4 shrink-0"/)
    const custom = render({}, { trigger: { children: <span data-glyph="up" /> } })
    expect(custom).toContain('data-glyph="up"')
    expect(custom).not.toContain('<svg')
  })

  it('gives both parts the same Button variant and size', () => {
    for (const [props, expected] of [
      [{}, ['bg-primary', 'h-9']],
      [{ variant: 'secondary', size: 'lg' }, ['bg-secondary', 'h-10']],
      [{ variant: 'primary', size: 'sm' }, ['bg-primary', 'h-8']],
      [{ variant: 'ghost', size: 'xs' }, ['hover:bg-accent', 'h-7']],
    ] as const) {
      const [action, caret] = buttons(render(props))
      expect(classList(action)).toEqual(expect.arrayContaining([...expected]))
      expect(classList(caret)).toEqual(expect.arrayContaining([...expected]))
    }
  })

  it('squares the caret and drops the size’s horizontal padding', () => {
    const caret = classList(buttons(render({ size: 'lg' }))[1])
    expect(caret).toEqual(expect.arrayContaining(['aspect-square', 'ps-0', 'pe-0']))
  })

  it('squares the corners where the parts meet', () => {
    const [action, caret] = buttons(render())
    expect(classList(action)).toContain('rounded-e-none')
    expect(classList(caret)).toContain('rounded-s-none')
  })

  it('shares the border of the outline variant and draws a hairline otherwise', () => {
    expect(classList(buttons(render({ variant: 'outline' }))[1])).toContain('-ms-px')
    expect(classList(buttons(render({ variant: 'outline' }))[1])).not.toContain('border-s-current/25')
    expect(classList(buttons(render({ variant: 'destructive' }))[1])).toEqual(
      expect.arrayContaining(['border-s', 'border-s-current/25']),
    )
  })

  it('renders a visible token focus ring on both parts', () => {
    for (const part of buttons(render())) {
      expect(classList(part)).toEqual(
        expect.arrayContaining([
          'focus-visible:ring-2',
          'focus-visible:ring-ring',
          'focus-visible:ring-offset-background',
          'focus-visible:z-10',
        ]),
      )
    }
  })

  it('disables both parts natively when the group is disabled', () => {
    const html = render({ disabled: true })
    expect(html).toMatch(/^<div[^>]*data-disabled=""/)
    for (const part of buttons(html)) {
      expect(part).toContain('disabled=""')
      expect(part).toContain('aria-disabled="true"')
    }
  })

  it('disables one part on its own', () => {
    const [action, caret] = buttons(render({}, { actionDisabled: true }))
    expect(action).toContain('disabled=""')
    expect(caret).not.toContain('disabled=""')

    const [action2, caret2] = buttons(render({}, { trigger: { disabled: true } }))
    expect(action2).not.toContain('disabled=""')
    expect(caret2).toContain('disabled=""')
  })

  it('extends each part’s hit area to 44 px without changing layout', () => {
    const html = render()
    const hitAreas = html.match(/<span aria-hidden="true" data-split-button-hit-area=""[^>]*>/g) ?? []
    expect(hitAreas).toHaveLength(2)
    for (const hitArea of hitAreas) {
      expect(hitArea).toContain('min-width:44px;min-height:44px')
      expect(hitArea).toMatch(/class="absolute /)
    }
    // Pinned to the seam so they grow outward and never overlap.
    expect(hitAreas[0]).toContain('end-0')
    expect(hitAreas[1]).toContain('start-0')
    for (const part of buttons(html)) expect(classList(part)).toContain('relative')
  })

  it('sizes the hit areas from minTapTarget', () => {
    expect(render({ minTapTarget: 48 })).toContain('min-width:48px;min-height:48px')
  })

  it('reports the menu state on the group and the caret', () => {
    const closed = render()
    expect(closed).toMatch(/^<div[^>]*data-state="closed"/)
    expect(buttons(closed)[1]).toContain('data-state="closed"')
    expect(closed).not.toContain('role="menu"')
  })

  it('renders an open menu named by the caret', () => {
    const html = render({ defaultOpen: true })
    expect(html).toMatch(/^<div[^>]*data-state="open"/)
    const caret = buttons(html)[1]
    expect(caret).toContain('aria-expanded="true"')
    const caretId = /id="([^"]+)"/.exec(caret)?.[1]
    expect(caretId).toBeTruthy()
    expect(html).toContain(`role="menu"`)
    expect(html).toContain(`aria-labelledby="${caretId}"`)
    expect(html).toContain('role="menuitem"')
    // Aligned to the caret's end edge by default.
    expect(html).toContain('data-align="end"')
  })

  it('passes attributes and className through to the group', () => {
    const html = render({ 'aria-label': 'Save document', className: 'my-4' })
    expect(html).toMatch(/^<div[^>]*aria-label="Save document"/)
    expect(classList(/^<div[^>]*>/.exec(html)![0])).toEqual(
      expect.arrayContaining(['inline-flex', 'isolate', 'my-4']),
    )
  })

  it('throws outside a SplitButton', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => renderToString(<SplitButtonTrigger />)).toThrow(
      'SplitButtonTrigger must be used within <SplitButton>',
    )
  })
})
