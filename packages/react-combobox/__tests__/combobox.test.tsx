import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '../src/combobox.js'

const h = React.createElement

describe('Combobox (root)', () => {
  it('renders children', () => {
    const html = renderToString(h(Combobox, null, h('span', null, 'child')))
    expect(html).toContain('child')
  })

  it('does not render content when closed', () => {
    const html = renderToString(
      h(
        Combobox,
        null,
        h(ComboboxTrigger, null, 'Pick'),
        h(ComboboxContent, null, h('div', null, 'Hidden Body')),
      ),
    )
    expect(html).not.toContain('Hidden Body')
  })

  it('renders content when defaultOpen is true', () => {
    const html = renderToString(
      h(
        Combobox,
        { defaultOpen: true },
        h(ComboboxContent, null, h('div', null, 'Visible Body')),
      ),
    )
    expect(html).toContain('Visible Body')
  })
})

describe('ComboboxTrigger', () => {
  it('renders a button element', () => {
    const html = renderToString(
      h(Combobox, null, h(ComboboxTrigger, null, 'Pick one')),
    )
    expect(html).toContain('<button')
    expect(html).toContain('type="button"')
    expect(html).toContain('Pick one')
  })

  it('has role combobox', () => {
    const html = renderToString(h(Combobox, null, h(ComboboxTrigger)))
    expect(html).toContain('role="combobox"')
  })

  it('aria-expanded is false when closed', () => {
    const html = renderToString(h(Combobox, null, h(ComboboxTrigger)))
    expect(html).toContain('aria-expanded="false"')
  })

  it('aria-expanded is true when defaultOpen', () => {
    const html = renderToString(
      h(Combobox, { defaultOpen: true }, h(ComboboxTrigger)),
    )
    expect(html).toContain('aria-expanded="true"')
  })

  it('data-state reflects open/closed', () => {
    const closed = renderToString(h(Combobox, null, h(ComboboxTrigger)))
    expect(closed).toContain('data-state="closed"')
    const open = renderToString(
      h(Combobox, { defaultOpen: true }, h(ComboboxTrigger)),
    )
    expect(open).toContain('data-state="open"')
  })

  it('aria-haspopup is listbox', () => {
    const html = renderToString(h(Combobox, null, h(ComboboxTrigger)))
    expect(html).toContain('aria-haspopup="listbox"')
  })

  it('shows placeholder when no value', () => {
    const html = renderToString(
      h(Combobox, null, h(ComboboxTrigger, { placeholder: 'Choose fruit…' })),
    )
    expect(html).toContain('Choose fruit…')
  })

  it('disabled trigger has disabled attribute and aria-disabled', () => {
    const html = renderToString(
      h(Combobox, { disabled: true }, h(ComboboxTrigger)),
    )
    expect(html).toContain('disabled')
    expect(html).toContain('aria-disabled="true"')
  })

  it('renders chevron SVG', () => {
    const html = renderToString(h(Combobox, null, h(ComboboxTrigger)))
    expect(html).toContain('<svg')
    expect(html).toContain('m6 9 6 6 6-6')
  })

  it('applies size variant classes', () => {
    const sm = renderToString(
      h(Combobox, null, h(ComboboxTrigger, { size: 'sm' })),
    )
    expect(sm).toContain('h-8')
    const lg = renderToString(
      h(Combobox, null, h(ComboboxTrigger, { size: 'lg' })),
    )
    expect(lg).toContain('h-10')
  })

  it('applies custom className', () => {
    const html = renderToString(
      h(Combobox, null, h(ComboboxTrigger, { className: 'my-trigger' })),
    )
    expect(html).toContain('my-trigger')
  })

  it('aria-controls points to content id', () => {
    const html = renderToString(h(Combobox, null, h(ComboboxTrigger)))
    expect(html).toMatch(/aria-controls="[^"]*-content"/)
  })
})

describe('ComboboxContent / Input / List', () => {
  it('content has data-state open when open', () => {
    const html = renderToString(
      h(Combobox, { defaultOpen: true }, h(ComboboxContent, null, h('span', null, 'inside'))),
    )
    expect(html).toContain('data-state="open"')
    expect(html).toContain('inside')
  })

  it('input has role combobox and aria-autocomplete', () => {
    const html = renderToString(
      h(
        Combobox,
        { defaultOpen: true },
        h(ComboboxContent, null, h(ComboboxInput, { placeholder: 'Search…' })),
      ),
    )
    expect(html).toContain('role="combobox"')
    expect(html).toContain('aria-autocomplete="list"')
    expect(html).toContain('placeholder="Search…"')
  })

  it('list has role listbox', () => {
    const html = renderToString(
      h(
        Combobox,
        { defaultOpen: true },
        h(
          ComboboxContent,
          null,
          h(ComboboxList, null, h(ComboboxItem, { value: 'a' }, 'Apple')),
        ),
      ),
    )
    expect(html).toContain('role="listbox"')
  })
})

describe('ComboboxItem', () => {
  it('renders item with role option', () => {
    const html = renderToString(
      h(
        Combobox,
        { defaultOpen: true },
        h(
          ComboboxContent,
          null,
          h(ComboboxList, null, h(ComboboxItem, { value: 'a' }, 'Apple')),
        ),
      ),
    )
    expect(html).toContain('role="option"')
    expect(html).toContain('Apple')
  })

  it('marks selected item with aria-selected true', () => {
    const html = renderToString(
      h(
        Combobox,
        { defaultOpen: true, value: 'a' },
        h(
          ComboboxContent,
          null,
          h(ComboboxList, null, h(ComboboxItem, { value: 'a' }, 'Apple')),
        ),
      ),
    )
    expect(html).toContain('aria-selected="true"')
  })

  it('marks unselected item with aria-selected false', () => {
    const html = renderToString(
      h(
        Combobox,
        { defaultOpen: true, value: 'a' },
        h(
          ComboboxContent,
          null,
          h(ComboboxList, null, h(ComboboxItem, { value: 'b' }, 'Banana')),
        ),
      ),
    )
    expect(html).toContain('aria-selected="false"')
  })

  it('disabled item has aria-disabled and data-disabled', () => {
    const html = renderToString(
      h(
        Combobox,
        { defaultOpen: true },
        h(
          ComboboxContent,
          null,
          h(
            ComboboxList,
            null,
            h(ComboboxItem, { value: 'c', disabled: true }, 'Cherry'),
          ),
        ),
      ),
    )
    expect(html).toContain('aria-disabled="true"')
    expect(html).toContain('data-disabled')
  })

  it('item carries data-value attribute', () => {
    const html = renderToString(
      h(
        Combobox,
        { defaultOpen: true },
        h(
          ComboboxContent,
          null,
          h(ComboboxList, null, h(ComboboxItem, { value: 'kiwi' }, 'Kiwi')),
        ),
      ),
    )
    expect(html).toContain('data-value="kiwi"')
  })
})

describe('Trigger label reflects selected value via options prop', () => {
  it('shows label of selected option when provided via options', () => {
    const html = renderToString(
      h(
        Combobox,
        {
          value: 'b',
          options: [
            { value: 'a', label: 'Apple' },
            { value: 'b', label: 'Banana' },
          ],
        },
        h(ComboboxTrigger),
      ),
    )
    expect(html).toContain('Banana')
  })
})

describe('Empty state', () => {
  it('does not show empty when items present', () => {
    const html = renderToString(
      h(
        Combobox,
        { defaultOpen: true },
        h(
          ComboboxContent,
          null,
          h(ComboboxList, null, h(ComboboxItem, { value: 'a' }, 'Apple')),
          h(ComboboxEmpty, null, 'Nothing here'),
        ),
      ),
    )
    // SSR: hasVisible defaults to true, so empty should not render text
    expect(html).not.toContain('Nothing here')
  })
})

describe('Default rendered list (no children)', () => {
  it('auto-renders options from options prop with default content body', () => {
    const html = renderToString(
      h(
        Combobox,
        {
          defaultOpen: true,
          options: [
            { value: 'a', label: 'Apple' },
            { value: 'b', label: 'Banana' },
          ],
        },
        h(ComboboxContent),
      ),
    )
    expect(html).toContain('Apple')
    expect(html).toContain('Banana')
    expect(html).toContain('role="listbox"')
  })
})
