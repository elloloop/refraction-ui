import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetIdCounter } from '@refraction-ui/shared'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../src/tabs.js'

beforeEach(() => {
  resetIdCounter()
})

describe('Tabs (React SSR)', () => {
  it('renders tabs root with data-orientation', () => {
    const html = renderToString(
      React.createElement(Tabs, { defaultValue: 'tab1' }, 'children'),
    )
    expect(html).toContain('data-orientation="horizontal"')
  })

  it('renders tabs root with vertical orientation', () => {
    const html = renderToString(
      React.createElement(
        Tabs,
        { defaultValue: 'tab1', orientation: 'vertical' },
        'children',
      ),
    )
    expect(html).toContain('data-orientation="vertical"')
  })

  it('renders tab list with tablist role', () => {
    const html = renderToString(
      React.createElement(
        Tabs,
        { defaultValue: 'tab1' },
        React.createElement(TabsList, null, 'List'),
      ),
    )
    expect(html).toContain('role="tablist"')
    expect(html).toContain('aria-orientation="horizontal"')
    expect(html).toContain('List')
  })

  it('renders tab trigger with tab role', () => {
    const html = renderToString(
      React.createElement(
        Tabs,
        { defaultValue: 'tab1' },
        React.createElement(
          TabsList,
          null,
          React.createElement(TabsTrigger, { value: 'tab1' }, 'Tab 1'),
        ),
      ),
    )
    expect(html).toContain('role="tab"')
    expect(html).toContain('Tab 1')
    expect(html).toContain('aria-selected="true"')
    expect(html).toContain('tabindex="0"')
    expect(html).toContain('data-state="active"')
  })

  it('renders inactive tab trigger', () => {
    const html = renderToString(
      React.createElement(
        Tabs,
        { defaultValue: 'tab1' },
        React.createElement(
          TabsList,
          null,
          React.createElement(TabsTrigger, { value: 'tab2' }, 'Tab 2'),
        ),
      ),
    )
    expect(html).toContain('aria-selected="false"')
    expect(html).toContain('tabindex="-1"')
    expect(html).toContain('data-state="inactive"')
  })

  it('renders active tab content', () => {
    const html = renderToString(
      React.createElement(
        Tabs,
        { defaultValue: 'tab1' },
        React.createElement(TabsContent, { value: 'tab1' }, 'Content 1'),
      ),
    )
    expect(html).toContain('role="tabpanel"')
    expect(html).toContain('Content 1')
    expect(html).toContain('data-state="active"')
    expect(html).toContain('tabindex="0"')
  })

  it('does not render inactive tab content', () => {
    const html = renderToString(
      React.createElement(
        Tabs,
        { defaultValue: 'tab1' },
        React.createElement(TabsContent, { value: 'tab2' }, 'Content 2'),
      ),
    )
    expect(html).not.toContain('Content 2')
    expect(html).not.toContain('role="tabpanel"')
  })

  it('links tab aria-controls to panel id', () => {
    const html = renderToString(
      React.createElement(
        Tabs,
        { defaultValue: 'tab1' },
        React.createElement(
          TabsList,
          null,
          React.createElement(TabsTrigger, { value: 'tab1' }, 'Tab 1'),
        ),
        React.createElement(TabsContent, { value: 'tab1' }, 'Content 1'),
      ),
    )
    // Both should reference the same panel id pattern
    expect(html).toContain('aria-controls')
    expect(html).toContain('aria-labelledby')
    expect(html).toContain('rfr-tabs')
  })

  it('applies custom className to tabs root', () => {
    const html = renderToString(
      React.createElement(Tabs, { defaultValue: 'tab1', className: 'my-tabs' }),
    )
    expect(html).toContain('my-tabs')
  })

  it('applies custom className to list', () => {
    const html = renderToString(
      React.createElement(
        Tabs,
        { defaultValue: 'tab1' },
        React.createElement(TabsList, { className: 'my-list' }),
      ),
    )
    expect(html).toContain('my-list')
  })

  it('applies custom className to trigger', () => {
    const html = renderToString(
      React.createElement(
        Tabs,
        { defaultValue: 'tab1' },
        React.createElement(
          TabsList,
          null,
          React.createElement(TabsTrigger, { value: 'tab1', className: 'my-trigger' }, 'T'),
        ),
      ),
    )
    expect(html).toContain('my-trigger')
  })

  it('applies custom className to content', () => {
    const html = renderToString(
      React.createElement(
        Tabs,
        { defaultValue: 'tab1' },
        React.createElement(TabsContent, { value: 'tab1', className: 'my-panel' }, 'P'),
      ),
    )
    expect(html).toContain('my-panel')
  })

  it('renders complete tabs composition', () => {
    const html = renderToString(
      React.createElement(
        Tabs,
        { defaultValue: 'account' },
        React.createElement(
          TabsList,
          null,
          React.createElement(TabsTrigger, { value: 'account' }, 'Account'),
          React.createElement(TabsTrigger, { value: 'password' }, 'Password'),
        ),
        React.createElement(TabsContent, { value: 'account' }, 'Account settings'),
        React.createElement(TabsContent, { value: 'password' }, 'Password settings'),
      ),
    )
    expect(html).toContain('Account')
    expect(html).toContain('Password')
    expect(html).toContain('Account settings')
    // Password content should not render since account is active
    expect(html).not.toContain('Password settings')
    expect(html).toContain('role="tablist"')
    expect(html).toContain('role="tab"')
    expect(html).toContain('role="tabpanel"')
  })

  it('throws when compound components used outside provider', () => {
    expect(() => {
      renderToString(
        React.createElement(TabsList, null, 'List'),
      )
    }).toThrow('Tabs compound components must be used within <Tabs>')
  })

  it('multiple TabsTrigger renders all tabs', () => {
    const html = renderToString(
      React.createElement(
        Tabs,
        { defaultValue: 'a' },
        React.createElement(
          TabsList,
          null,
          React.createElement(TabsTrigger, { value: 'a' }, 'Tab A'),
          React.createElement(TabsTrigger, { value: 'b' }, 'Tab B'),
          React.createElement(TabsTrigger, { value: 'c' }, 'Tab C'),
        ),
      ),
    )
    expect(html).toContain('Tab A')
    expect(html).toContain('Tab B')
    expect(html).toContain('Tab C')
    const matches = html.match(/role="tab"/g)
    expect(matches).toHaveLength(3)
  })

  it('TabsContent shows only active panel', () => {
    const html = renderToString(
      React.createElement(
        Tabs,
        { defaultValue: 'first' },
        React.createElement(TabsContent, { value: 'first' }, 'First Panel'),
        React.createElement(TabsContent, { value: 'second' }, 'Second Panel'),
      ),
    )
    expect(html).toContain('First Panel')
    expect(html).not.toContain('Second Panel')
  })

  it('TabsContent hidden for inactive tab (not rendered)', () => {
    const html = renderToString(
      React.createElement(
        Tabs,
        { defaultValue: 'active' },
        React.createElement(TabsContent, { value: 'inactive' }, 'Should not appear'),
      ),
    )
    expect(html).not.toContain('Should not appear')
    expect(html).not.toContain('role="tabpanel"')
  })

  it('data-orientation on root defaults to horizontal', () => {
    const html = renderToString(
      React.createElement(Tabs, { defaultValue: 'x' }, 'child'),
    )
    expect(html).toContain('data-orientation="horizontal"')
  })

  it('data-orientation on root can be vertical', () => {
    const html = renderToString(
      React.createElement(Tabs, { defaultValue: 'x', orientation: 'vertical' }, 'child'),
    )
    expect(html).toContain('data-orientation="vertical"')
  })

  it('custom className on TabsList is applied', () => {
    const html = renderToString(
      React.createElement(
        Tabs,
        { defaultValue: 'x' },
        React.createElement(TabsList, { className: 'my-custom-list' }),
      ),
    )
    expect(html).toContain('my-custom-list')
  })
})
