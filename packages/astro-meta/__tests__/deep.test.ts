import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
// @ts-expect-error -- .astro modules are compiled by the Astro vite plugin
import TabsComposition from './compositions/tabs.astro'
// @ts-expect-error -- .astro modules are compiled by the Astro vite plugin
import SelectComposition from './compositions/select.astro'
// @ts-expect-error -- .astro modules are compiled by the Astro vite plugin
import DialogComposition from './compositions/dialog.astro'
// @ts-expect-error -- .astro modules are compiled by the Astro vite plugin
import CommandComposition from './compositions/command.astro'
// @ts-expect-error -- .astro modules are compiled by the Astro vite plugin
import RadioComposition from './compositions/radio.astro'
// @ts-expect-error -- .astro modules are compiled by the Astro vite plugin
import DropdownMenuComposition from './compositions/dropdown-menu.astro'
// @ts-expect-error -- .astro modules are compiled by the Astro vite plugin
import ToasterComposition from './compositions/toaster.astro'
// @ts-expect-error -- .astro modules are compiled by the Astro vite plugin
import Switch from '../dist/astro-switch/Switch.astro'

/**
 * Deep render tests for the stateful / ARIA-heavy adapters. Multi-part
 * components are rendered as real compositions (`__tests__/compositions/`)
 * through the Container API; assertions cover roles, aria-* wiring, the
 * data-attribute contract the client scripts drive, and slot content.
 *
 * Note on matching: Astro pads SSR slot output with whitespace, so text
 * assertions use `\s*` around the expected content.
 */

async function render(
  component: unknown,
  options?: { props?: Record<string, unknown>; slots?: Record<string, string> }
): Promise<string> {
  const container = await AstroContainer.create()
  return container.renderToString(
    component as Parameters<AstroContainer['renderToString']>[0],
    options
  )
}

/** Count occurrences of an attribute marker like `role="tab"`. */
function count(html: string, marker: string): number {
  return html.split(marker).length - 1
}

describe('astro-tabs (composed)', () => {
  it('renders tablist/tab/tabpanel roles with selection ARIA', async () => {
    const html = await render(TabsComposition)

    // Root wiring the client script drives.
    expect(html).toContain('data-rfr-tabs')
    expect(html).toContain('data-rfr-tabs-value="account"')
    expect(html).toContain('data-orientation="horizontal"')
    expect(html).toContain('data-rfr-tabs-id-prefix')

    // Structure + roles.
    expect(html).toContain('role="tablist"')
    expect(count(html, 'role="tab"')).toBe(2)
    expect(count(html, 'role="tabpanel"')).toBe(2)

    // Selected vs unselected trigger.
    expect(html).toMatch(
      /<button[^>]*aria-selected="true"[^>]*tabindex="0"[^>]*data-rfr-tab-value="account"[^>]*>\s*Account\s*<\/button>/
    )
    expect(html).toMatch(
      /<button[^>]*aria-selected="false"[^>]*tabindex="-1"[^>]*data-rfr-tab-value="profile"[^>]*>\s*Profile\s*<\/button>/
    )

    // Active panel visible, inactive panel hidden; slot content rendered.
    expect(html).toMatch(/<div[^>]*data-rfr-tab-panel="account"[^>]*>\s*Account panel content\s*<\/div>/)
    expect(html).not.toMatch(/<div[^>]*data-rfr-tab-panel="account"[^>]*hidden/)
    expect(html).toMatch(/<div[^>]*data-rfr-tab-panel="profile"[^>]*hidden[^>]*>\s*Profile panel content\s*<\/div>/)
  })
})

describe('astro-select (composed)', () => {
  it('renders combobox/listbox/option with value and disabled state', async () => {
    const html = await render(SelectComposition)

    // Root value + form wiring (hidden input carries the value for forms).
    expect(html).toContain('data-rfr-select')
    expect(html).toContain('data-rfr-select-value="apple"')
    expect(html).toMatch(/<input[^>]*type="hidden"[^>]*name="fruit"[^>]*value="apple"/)

    // Trigger: collapsed combobox showing the selected value.
    expect(html).toContain('role="combobox"')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toMatch(/data-rfr-select-value-text>\s*Apple\s*<\/span>/)

    // Listbox starts hidden.
    expect(html).toMatch(/<div[^>]*role="listbox"[^>]*hidden/)

    // Options: selected and disabled states.
    expect(count(html, 'role="option"')).toBe(2)
    expect(html).toMatch(/<div[^>]*role="option"[^>]*aria-selected="true"[^>]*data-rfr-select-item-value="apple"/)
    expect(html).toMatch(/<div[^>]*role="option"[^>]*aria-disabled="true"[^>]*data-rfr-select-item-value="banana"/)
  })
})

describe('astro-dialog (composed)', () => {
  it('renders dialog role, modal ARIA and defaultOpen state', async () => {
    const html = await render(DialogComposition)

    // Root reflects defaultOpen in its state machine attributes.
    expect(html).toContain('data-rfr-dialog')
    expect(html).toContain('data-rfr-dialog-modal="true"')
    expect(html).toContain('data-state="open"')

    // Trigger advertises the popup.
    expect(html).toContain('aria-haspopup="dialog"')
    expect(html).toContain('Open settings')

    // Content carries the dialog role + modality (client script unhides it).
    expect(html).toMatch(/<div[^>]*role="dialog"[^>]*aria-modal="true"/)
    expect(html).toContain('data-rfr-dialog-content')

    // Title/description slots.
    expect(html).toMatch(/<h2[^>]*data-rfr-dialog-title[^>]*>\s*Settings\s*<\/h2>/)
    expect(html).toContain('Adjust your preferences.')
  })
})

describe('astro-command (composed)', () => {
  it('renders combobox + searchbox + listbox + options', async () => {
    const html = await render(CommandComposition)

    expect(html).toContain('data-rfr-command')
    expect(html).toContain('role="combobox"')
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('aria-haspopup="listbox"')

    expect(html).toMatch(/<input[^>]*role="searchbox"[^>]*aria-autocomplete="list"/)
    expect(html).toContain('role="listbox"')

    expect(count(html, 'role="option"')).toBe(2)
    expect(html).toMatch(/<div[^>]*data-value="open"[^>]*role="option"[^>]*>\s*Open file\s*<\/div>/)
    expect(html).toMatch(/<div[^>]*data-value="delete"[^>]*role="option"[^>]*aria-disabled="true"[^>]*>\s*Delete file\s*<\/div>/)

    // Empty state starts hidden.
    expect(html).toMatch(/<div[^>]*data-rfr-command-empty[^>]*hidden[^>]*>\s*No results\.\s*<\/div>/)
  })
})

describe('astro-radio (composed)', () => {
  it('renders radiogroup/radio roles with checked state and form input', async () => {
    const html = await render(RadioComposition)

    expect(html).toContain('role="radiogroup"')
    expect(html).toContain('aria-orientation="vertical"')
    expect(html).toMatch(/<input[^>]*type="hidden"[^>]*name="choice"[^>]*value="a"/)

    expect(count(html, 'role="radio"')).toBe(2)
    expect(html).toMatch(/<button[^>]*role="radio"[^>]*aria-checked="true"[^>]*tabindex="0"/)
    expect(html).toMatch(/<button[^>]*role="radio"[^>]*aria-checked="false"[^>]*tabindex="-1"/)
    expect(html).toContain('Option A')
    expect(html).toContain('Option B')
  })
})

describe('astro-dropdown-menu (composed)', () => {
  it('renders menu/menuitem roles with trigger ARIA', async () => {
    const html = await render(DropdownMenuComposition)

    expect(html).toContain('data-rfr-dropdown-menu')
    expect(html).toMatch(/<button[^>]*data-rfr-dropdown-trigger[^>]*aria-haspopup="menu"[^>]*aria-expanded="false"[^>]*>\s*Actions\s*<\/button>/)

    // Menu starts hidden.
    expect(html).toMatch(/<div[^>]*role="menu"[^>]*hidden/)

    expect(count(html, 'role="menuitem"')).toBe(2)
    expect(html).toMatch(/<div[^>]*role="menuitem"[^>]*>\s*Rename\s*<\/div>/)
    expect(html).toMatch(/<div[^>]*role="menuitem"[^>]*tabindex="-1"[^>]*aria-disabled="true"[^>]*>\s*Archive\s*<\/div>/)
  })
})

describe('astro-toast (Toaster + Toast composed)', () => {
  it('renders alert ARIA, variant data and dismiss affordance', async () => {
    const html = await render(ToasterComposition)

    expect(html).toContain('data-rfr-toaster')

    expect(html).toMatch(
      /<div[^>]*data-rfr-toast[^>]*role="alert"[^>]*aria-live="assertive"[^>]*aria-atomic="true"/
    )
    expect(html).toContain('data-rfr-toast-variant="success"')
    expect(html).toContain('data-rfr-toast-duration="5000"')
    expect(html).toContain('Saved successfully')
    expect(html).toMatch(/<button[^>]*aria-label="Dismiss"/)
  })
})

describe('astro-switch', () => {
  it('renders switch role with checked ARIA and form input', async () => {
    const html = await render(Switch, {
      props: { checked: true, name: 'notifications' },
    })

    expect(html).toMatch(/<button[^>]*role="switch"[^>]*aria-checked="true"[^>]*data-state="checked"/)
    expect(html).toMatch(/<input[^>]*type="hidden"[^>]*name="notifications"[^>]*value="true"/)
  })

  it('renders unchecked state by default', async () => {
    const html = await render(Switch)

    expect(html).toMatch(/<button[^>]*role="switch"[^>]*aria-checked="false"[^>]*data-state="unchecked"/)
  })
})
