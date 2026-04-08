import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Button } from '../src/button.js'

describe('Button (React)', () => {
  it('renders a button element', () => {
    const html = renderToString(React.createElement(Button, null, 'Click me'))
    expect(html).toContain('<button')
    expect(html).toContain('Click me')
    expect(html).toContain('type="button"')
  })

  it('applies variant classes', () => {
    const html = renderToString(
      React.createElement(Button, { variant: 'destructive' }, 'Delete'),
    )
    expect(html).toContain('bg-destructive')
  })

  it('applies size classes', () => {
    const html = renderToString(
      React.createElement(Button, { size: 'sm' }, 'Small'),
    )
    expect(html).toContain('h-8')
  })

  it('shows spinner when loading', () => {
    const html = renderToString(
      React.createElement(Button, { loading: true }, 'Loading'),
    )
    expect(html).toContain('animate-spin')
    expect(html).toContain('aria-disabled="true"')
  })

  it('sets disabled state', () => {
    const html = renderToString(
      React.createElement(Button, { disabled: true }, 'Disabled'),
    )
    expect(html).toContain('disabled')
    expect(html).toContain('aria-disabled="true"')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(Button, { className: 'my-class' }, 'Custom'),
    )
    expect(html).toContain('my-class')
  })

  it('renders as submit type', () => {
    const html = renderToString(
      React.createElement(Button, { type: 'submit' }, 'Submit'),
    )
    expect(html).toContain('type="submit"')
  })
})

describe('Button (React) - variant coverage', () => {
  it('renders default variant with bg-primary', () => {
    const html = renderToString(React.createElement(Button, { variant: 'default' }, 'Btn'))
    expect(html).toContain('bg-primary')
  })

  it('renders destructive variant with bg-destructive', () => {
    const html = renderToString(React.createElement(Button, { variant: 'destructive' }, 'Btn'))
    expect(html).toContain('bg-destructive')
  })

  it('renders outline variant with border', () => {
    const html = renderToString(React.createElement(Button, { variant: 'outline' }, 'Btn'))
    expect(html).toContain('border')
    expect(html).toContain('bg-background')
  })

  it('renders secondary variant with bg-secondary', () => {
    const html = renderToString(React.createElement(Button, { variant: 'secondary' }, 'Btn'))
    expect(html).toContain('bg-secondary')
  })

  it('renders ghost variant with hover:bg-accent', () => {
    const html = renderToString(React.createElement(Button, { variant: 'ghost' }, 'Btn'))
    expect(html).toContain('hover:bg-accent')
  })

  it('renders link variant with underline-offset-4', () => {
    const html = renderToString(React.createElement(Button, { variant: 'link' }, 'Btn'))
    expect(html).toContain('underline-offset-4')
  })
})

describe('Button (React) - size coverage', () => {
  it('renders xs size with h-7', () => {
    const html = renderToString(React.createElement(Button, { size: 'xs' }, 'Btn'))
    expect(html).toContain('h-7')
  })

  it('renders sm size with h-8', () => {
    const html = renderToString(React.createElement(Button, { size: 'sm' }, 'Btn'))
    expect(html).toContain('h-8')
  })

  it('renders default size with h-9', () => {
    const html = renderToString(React.createElement(Button, { size: 'default' }, 'Btn'))
    expect(html).toContain('h-9')
  })

  it('renders lg size with h-10', () => {
    const html = renderToString(React.createElement(Button, { size: 'lg' }, 'Btn'))
    expect(html).toContain('h-10')
  })

  it('renders icon size with w-9', () => {
    const html = renderToString(React.createElement(Button, { size: 'icon' }, 'Btn'))
    expect(html).toContain('w-9')
  })
})

describe('Button (React) - loading behavior', () => {
  it('loading shows spinner SVG with animate-spin class', () => {
    const html = renderToString(React.createElement(Button, { loading: true }, 'Wait'))
    expect(html).toContain('<svg')
    expect(html).toContain('animate-spin')
  })

  it('loading disables the button via disabled attribute', () => {
    const html = renderToString(React.createElement(Button, { loading: true }, 'Wait'))
    expect(html).toContain('disabled')
  })

  it('loading sets aria-disabled="true"', () => {
    const html = renderToString(React.createElement(Button, { loading: true }, 'Wait'))
    expect(html).toContain('aria-disabled="true"')
  })

  it('loading sets data-loading attribute', () => {
    const html = renderToString(React.createElement(Button, { loading: true }, 'Wait'))
    expect(html).toContain('data-loading')
  })
})

describe('Button (React) - className handling', () => {
  it('custom className is appended, not replaced', () => {
    const html = renderToString(React.createElement(Button, { className: 'extra-class' }, 'Btn'))
    // Should contain both the default variant class AND the custom class
    expect(html).toContain('bg-primary')
    expect(html).toContain('extra-class')
  })
})

describe('Button (React) - children rendering', () => {
  it('children text renders inside button', () => {
    const html = renderToString(React.createElement(Button, null, 'Hello World'))
    expect(html).toContain('Hello World')
  })

  it('children element renders inside button', () => {
    const html = renderToString(
      React.createElement(Button, null, React.createElement('span', null, 'Inner')),
    )
    expect(html).toContain('<span')
    expect(html).toContain('Inner')
  })
})

describe('Button (React) - type attribute', () => {
  it('type="submit" renders correctly', () => {
    const html = renderToString(React.createElement(Button, { type: 'submit' }, 'Go'))
    expect(html).toContain('type="submit"')
  })

  it('type="reset" renders correctly', () => {
    const html = renderToString(React.createElement(Button, { type: 'reset' }, 'Reset'))
    expect(html).toContain('type="reset"')
  })

  it('default type is "button"', () => {
    const html = renderToString(React.createElement(Button, null, 'Btn'))
    expect(html).toContain('type="button"')
  })
})
