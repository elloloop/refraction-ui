import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetIdCounter } from '@refraction-ui/shared'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '../src/command.js'

beforeEach(() => {
  resetIdCounter()
})

describe('Command (React SSR)', () => {
  it('renders with combobox role', () => {
    const html = renderToString(
      React.createElement(Command, null),
    )
    expect(html).toContain('role="combobox"')
  })

  it('renders with command variant styles', () => {
    const html = renderToString(
      React.createElement(Command, null),
    )
    expect(html).toContain('rounded-md')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(Command, { className: 'my-command' }),
    )
    expect(html).toContain('my-command')
  })

  it('renders children', () => {
    const html = renderToString(
      React.createElement(
        Command,
        null,
        React.createElement('span', null, 'Hello'),
      ),
    )
    expect(html).toContain('Hello')
  })
})

describe('CommandInput (React SSR)', () => {
  it('renders an input with searchbox role', () => {
    const html = renderToString(
      React.createElement(
        Command,
        null,
        React.createElement(CommandInput, { placeholder: 'Search...' }),
      ),
    )
    expect(html).toContain('<input')
    expect(html).toContain('role="searchbox"')
    expect(html).toContain('placeholder="Search..."')
  })

  it('renders with aria-autocomplete', () => {
    const html = renderToString(
      React.createElement(
        Command,
        null,
        React.createElement(CommandInput, null),
      ),
    )
    expect(html).toContain('aria-autocomplete="list"')
  })

  it('renders with aria-controls linking to list', () => {
    const html = renderToString(
      React.createElement(
        Command,
        null,
        React.createElement(CommandInput, null),
      ),
    )
    expect(html).toContain('aria-controls')
    expect(html).toContain('rfr-cmd-list')
  })
})

describe('CommandList (React SSR)', () => {
  it('renders with listbox role', () => {
    const html = renderToString(
      React.createElement(
        Command,
        null,
        React.createElement(CommandList, null),
      ),
    )
    expect(html).toContain('role="listbox"')
  })

  it('renders with correct id', () => {
    const html = renderToString(
      React.createElement(
        Command,
        null,
        React.createElement(CommandList, null),
      ),
    )
    expect(html).toContain('rfr-cmd-list')
  })

  it('renders children', () => {
    const html = renderToString(
      React.createElement(
        Command,
        null,
        React.createElement(
          CommandList,
          null,
          React.createElement('div', null, 'List content'),
        ),
      ),
    )
    expect(html).toContain('List content')
  })
})

describe('CommandEmpty (React SSR)', () => {
  it('renders empty message when no items', () => {
    const html = renderToString(
      React.createElement(
        Command,
        null,
        React.createElement(CommandEmpty, null, 'No results found.'),
      ),
    )
    expect(html).toContain('No results found.')
  })

  it('has presentation role', () => {
    const html = renderToString(
      React.createElement(
        Command,
        null,
        React.createElement(CommandEmpty, null, 'Empty'),
      ),
    )
    expect(html).toContain('role="presentation"')
  })
})

describe('CommandGroup (React SSR)', () => {
  it('renders with group role', () => {
    const html = renderToString(
      React.createElement(
        Command,
        null,
        React.createElement(CommandGroup, { heading: 'Actions' }, 'Content'),
      ),
    )
    expect(html).toContain('role="group"')
    expect(html).toContain('Actions')
    expect(html).toContain('Content')
  })

  it('renders with aria-label from heading', () => {
    const html = renderToString(
      React.createElement(
        Command,
        null,
        React.createElement(CommandGroup, { heading: 'Actions' }),
      ),
    )
    expect(html).toContain('aria-label="Actions"')
  })

  it('renders without heading', () => {
    const html = renderToString(
      React.createElement(
        Command,
        null,
        React.createElement(CommandGroup, null, 'Items here'),
      ),
    )
    expect(html).toContain('role="group"')
    expect(html).toContain('Items here')
  })
})

describe('CommandItem (React SSR)', () => {
  it('renders with option role', () => {
    const html = renderToString(
      React.createElement(
        Command,
        null,
        React.createElement(CommandItem, { value: 'test' }, 'Test Item'),
      ),
    )
    expect(html).toContain('role="option"')
    expect(html).toContain('Test Item')
  })

  it('renders data-value attribute', () => {
    const html = renderToString(
      React.createElement(
        Command,
        null,
        React.createElement(CommandItem, { value: 'my-val' }, 'Item'),
      ),
    )
    expect(html).toContain('data-value="my-val"')
  })

  it('renders disabled item with aria-disabled', () => {
    const html = renderToString(
      React.createElement(
        Command,
        null,
        React.createElement(CommandItem, { disabled: true }, 'Disabled'),
      ),
    )
    expect(html).toContain('aria-disabled="true"')
  })
})

describe('CommandSeparator (React SSR)', () => {
  it('renders with separator role', () => {
    const html = renderToString(
      React.createElement(
        Command,
        null,
        React.createElement(CommandSeparator, null),
      ),
    )
    expect(html).toContain('role="separator"')
  })

  it('renders with border styles', () => {
    const html = renderToString(
      React.createElement(
        Command,
        null,
        React.createElement(CommandSeparator, null),
      ),
    )
    expect(html).toContain('bg-border')
  })
})

describe('Command composition (React SSR)', () => {
  it('renders full command palette', () => {
    const html = renderToString(
      React.createElement(
        Command,
        null,
        React.createElement(CommandInput, { placeholder: 'Type a command...' }),
        React.createElement(
          CommandList,
          null,
          React.createElement(CommandEmpty, null, 'No results found.'),
          React.createElement(
            CommandGroup,
            { heading: 'Suggestions' },
            React.createElement(CommandItem, { value: 'calendar' }, 'Calendar'),
            React.createElement(CommandItem, { value: 'search' }, 'Search'),
          ),
          React.createElement(CommandSeparator, null),
          React.createElement(
            CommandGroup,
            { heading: 'Settings' },
            React.createElement(CommandItem, { value: 'profile' }, 'Profile'),
          ),
        ),
      ),
    )
    expect(html).toContain('role="combobox"')
    expect(html).toContain('role="searchbox"')
    expect(html).toContain('role="listbox"')
    expect(html).toContain('Calendar')
    expect(html).toContain('Search')
    expect(html).toContain('Profile')
    expect(html).toContain('Suggestions')
    expect(html).toContain('Settings')
    expect(html).toContain('role="separator"')
  })
})
