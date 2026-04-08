import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../src/card.js'

describe('Card (React)', () => {
  it('renders a div element', () => {
    const html = renderToString(React.createElement(Card, null, 'Content'))
    expect(html).toContain('<div')
    expect(html).toContain('Content')
  })

  it('has data-slot card', () => {
    const html = renderToString(React.createElement(Card))
    expect(html).toContain('data-slot="card"')
  })

  it('applies base card classes', () => {
    const html = renderToString(React.createElement(Card))
    expect(html).toContain('rounded-lg')
    expect(html).toContain('border')
    expect(html).toContain('bg-card')
    expect(html).toContain('text-card-foreground')
    expect(html).toContain('shadow')
  })

  it('applies custom className', () => {
    const html = renderToString(React.createElement(Card, { className: 'my-card' }))
    expect(html).toContain('my-card')
  })
})

describe('CardHeader (React)', () => {
  it('renders a div element', () => {
    const html = renderToString(React.createElement(CardHeader, null, 'Header'))
    expect(html).toContain('<div')
    expect(html).toContain('Header')
  })

  it('has data-slot card-header', () => {
    const html = renderToString(React.createElement(CardHeader))
    expect(html).toContain('data-slot="card-header"')
  })

  it('applies header classes', () => {
    const html = renderToString(React.createElement(CardHeader))
    expect(html).toContain('flex')
    expect(html).toContain('flex-col')
    expect(html).toContain('p-6')
  })

  it('applies custom className', () => {
    const html = renderToString(React.createElement(CardHeader, { className: 'my-header' }))
    expect(html).toContain('my-header')
  })
})

describe('CardTitle (React)', () => {
  it('renders an h3 element', () => {
    const html = renderToString(React.createElement(CardTitle, null, 'Title'))
    expect(html).toContain('<h3')
    expect(html).toContain('Title')
  })

  it('has data-slot card-title', () => {
    const html = renderToString(React.createElement(CardTitle))
    expect(html).toContain('data-slot="card-title"')
  })

  it('applies title classes', () => {
    const html = renderToString(React.createElement(CardTitle))
    expect(html).toContain('font-semibold')
    expect(html).toContain('tracking-tight')
  })

  it('applies custom className', () => {
    const html = renderToString(React.createElement(CardTitle, { className: 'my-title' }))
    expect(html).toContain('my-title')
  })
})

describe('CardDescription (React)', () => {
  it('renders a p element', () => {
    const html = renderToString(React.createElement(CardDescription, null, 'Desc'))
    expect(html).toContain('<p')
    expect(html).toContain('Desc')
  })

  it('has data-slot card-description', () => {
    const html = renderToString(React.createElement(CardDescription))
    expect(html).toContain('data-slot="card-description"')
  })

  it('applies description classes', () => {
    const html = renderToString(React.createElement(CardDescription))
    expect(html).toContain('text-sm')
    expect(html).toContain('text-muted-foreground')
  })

  it('applies custom className', () => {
    const html = renderToString(React.createElement(CardDescription, { className: 'my-desc' }))
    expect(html).toContain('my-desc')
  })
})

describe('CardContent (React)', () => {
  it('renders a div element', () => {
    const html = renderToString(React.createElement(CardContent, null, 'Body'))
    expect(html).toContain('<div')
    expect(html).toContain('Body')
  })

  it('has data-slot card-content', () => {
    const html = renderToString(React.createElement(CardContent))
    expect(html).toContain('data-slot="card-content"')
  })

  it('applies content classes', () => {
    const html = renderToString(React.createElement(CardContent))
    expect(html).toContain('p-6')
    expect(html).toContain('pt-0')
  })

  it('applies custom className', () => {
    const html = renderToString(React.createElement(CardContent, { className: 'my-content' }))
    expect(html).toContain('my-content')
  })
})

describe('CardFooter (React)', () => {
  it('renders a div element', () => {
    const html = renderToString(React.createElement(CardFooter, null, 'Footer'))
    expect(html).toContain('<div')
    expect(html).toContain('Footer')
  })

  it('has data-slot card-footer', () => {
    const html = renderToString(React.createElement(CardFooter))
    expect(html).toContain('data-slot="card-footer"')
  })

  it('applies footer classes', () => {
    const html = renderToString(React.createElement(CardFooter))
    expect(html).toContain('flex')
    expect(html).toContain('items-center')
    expect(html).toContain('p-6')
    expect(html).toContain('pt-0')
  })

  it('applies custom className', () => {
    const html = renderToString(React.createElement(CardFooter, { className: 'my-footer' }))
    expect(html).toContain('my-footer')
  })
})

describe('Card compound components', () => {
  it('renders full card structure', () => {
    const html = renderToString(
      React.createElement(
        Card,
        null,
        React.createElement(
          CardHeader,
          null,
          React.createElement(CardTitle, null, 'My Title'),
          React.createElement(CardDescription, null, 'My Description'),
        ),
        React.createElement(CardContent, null, 'Content here'),
        React.createElement(CardFooter, null, 'Footer here'),
      ),
    )
    expect(html).toContain('My Title')
    expect(html).toContain('My Description')
    expect(html).toContain('Content here')
    expect(html).toContain('Footer here')
    expect(html).toContain('data-slot="card"')
    expect(html).toContain('data-slot="card-header"')
    expect(html).toContain('data-slot="card-title"')
    expect(html).toContain('data-slot="card-description"')
    expect(html).toContain('data-slot="card-content"')
    expect(html).toContain('data-slot="card-footer"')
  })
})
