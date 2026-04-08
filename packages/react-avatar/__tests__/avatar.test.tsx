import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Avatar, AvatarImage, AvatarFallback } from '../src/avatar.js'

describe('Avatar (React)', () => {
  it('renders a span element', () => {
    const html = renderToString(React.createElement(Avatar))
    expect(html).toContain('<span')
  })

  it('has role img', () => {
    const html = renderToString(React.createElement(Avatar))
    expect(html).toContain('role="img"')
  })

  it('has data-slot avatar', () => {
    const html = renderToString(React.createElement(Avatar))
    expect(html).toContain('data-slot="avatar"')
  })

  it('applies default md size classes', () => {
    const html = renderToString(React.createElement(Avatar))
    expect(html).toContain('h-10')
    expect(html).toContain('w-10')
  })

  it('applies xs size', () => {
    const html = renderToString(React.createElement(Avatar, { size: 'xs' }))
    expect(html).toContain('h-6')
    expect(html).toContain('w-6')
  })

  it('applies sm size', () => {
    const html = renderToString(React.createElement(Avatar, { size: 'sm' }))
    expect(html).toContain('h-8')
    expect(html).toContain('w-8')
  })

  it('applies lg size', () => {
    const html = renderToString(React.createElement(Avatar, { size: 'lg' }))
    expect(html).toContain('h-12')
    expect(html).toContain('w-12')
  })

  it('applies xl size', () => {
    const html = renderToString(React.createElement(Avatar, { size: 'xl' }))
    expect(html).toContain('h-16')
    expect(html).toContain('w-16')
  })

  it('applies custom className', () => {
    const html = renderToString(React.createElement(Avatar, { className: 'my-avatar' }))
    expect(html).toContain('my-avatar')
  })

  it('base classes include rounded-full', () => {
    const html = renderToString(React.createElement(Avatar))
    expect(html).toContain('rounded-full')
  })

  it('base classes include overflow-hidden', () => {
    const html = renderToString(React.createElement(Avatar))
    expect(html).toContain('overflow-hidden')
  })
})

describe('AvatarImage (React)', () => {
  it('renders an img element', () => {
    const html = renderToString(
      React.createElement(
        Avatar,
        null,
        React.createElement(AvatarImage, { src: 'https://example.com/img.jpg', alt: 'User' }),
      ),
    )
    expect(html).toContain('<img')
    expect(html).toContain('src="https://example.com/img.jpg"')
    expect(html).toContain('alt="User"')
  })

  it('applies image classes', () => {
    const html = renderToString(
      React.createElement(
        Avatar,
        null,
        React.createElement(AvatarImage, { src: 'test.jpg' }),
      ),
    )
    expect(html).toContain('object-cover')
    expect(html).toContain('aspect-square')
  })

  it('applies custom className to image', () => {
    const html = renderToString(
      React.createElement(
        Avatar,
        null,
        React.createElement(AvatarImage, { src: 'test.jpg', className: 'my-img' }),
      ),
    )
    expect(html).toContain('my-img')
  })
})

describe('AvatarFallback (React)', () => {
  it('renders a span with fallback text', () => {
    const html = renderToString(
      React.createElement(
        Avatar,
        null,
        React.createElement(AvatarFallback, null, 'JD'),
      ),
    )
    expect(html).toContain('<span')
    expect(html).toContain('JD')
  })

  it('applies fallback base classes', () => {
    const html = renderToString(
      React.createElement(
        Avatar,
        null,
        React.createElement(AvatarFallback, null, 'AB'),
      ),
    )
    expect(html).toContain('flex')
    expect(html).toContain('items-center')
    expect(html).toContain('justify-center')
    expect(html).toContain('bg-muted')
  })

  it('applies custom className to fallback', () => {
    const html = renderToString(
      React.createElement(
        Avatar,
        null,
        React.createElement(AvatarFallback, { className: 'my-fallback' }, 'AB'),
      ),
    )
    expect(html).toContain('my-fallback')
  })

  it('inherits md size text-sm', () => {
    const html = renderToString(
      React.createElement(
        Avatar,
        { size: 'md' },
        React.createElement(AvatarFallback, null, 'AB'),
      ),
    )
    expect(html).toContain('text-sm')
  })

  it('inherits xl size text-lg', () => {
    const html = renderToString(
      React.createElement(
        Avatar,
        { size: 'xl' },
        React.createElement(AvatarFallback, null, 'AB'),
      ),
    )
    expect(html).toContain('text-lg')
  })
})

describe('Avatar compound rendering', () => {
  it('renders image and fallback together', () => {
    const html = renderToString(
      React.createElement(
        Avatar,
        null,
        React.createElement(AvatarImage, { src: 'test.jpg', alt: 'User' }),
        React.createElement(AvatarFallback, null, 'JD'),
      ),
    )
    expect(html).toContain('<img')
    expect(html).toContain('JD')
    expect(html).toContain('role="img"')
  })
})
