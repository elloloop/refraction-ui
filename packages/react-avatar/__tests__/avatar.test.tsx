import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Avatar, AvatarImage, AvatarFallback } from '../src/avatar.js'

describe('Avatar (React)', () => {
  it('renders a span element', () => {
    const html = renderToString(React.createElement(Avatar))
    expect(html).toContain('<span')
  })

  it('has no role without a name, so the inner image/fallback stays exposed', () => {
    const html = renderToString(React.createElement(Avatar))
    expect(html).not.toContain('role="img"')
  })

  it('is a named img when given an aria-label', () => {
    const html = renderToString(React.createElement(Avatar, { 'aria-label': 'Ada Lovelace' }))
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Ada Lovelace"')
  })

  it('is circular by default and square with shape="square"', () => {
    expect(renderToString(React.createElement(Avatar))).toContain('rounded-full')
    const square = renderToString(React.createElement(Avatar, { shape: 'square' }))
    expect(square).toContain('rounded-md')
    expect(square).not.toContain('rounded-full')
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

  it('does not clip its corner, where the presence dot sits', () => {
    const html = renderToString(React.createElement(Avatar))
    expect(html).not.toContain('overflow-hidden')
  })
})

describe('Avatar presence (React)', () => {
  function presenceDot(html: string): string | undefined {
    return html.match(/<span[^>]*data-slot="avatar-presence"[^>]*>/)?.[0]
  }

  it('renders no dot without presence', () => {
    const html = renderToString(<Avatar aria-label="Ada Lovelace"><AvatarFallback>AL</AvatarFallback></Avatar>)
    expect(presenceDot(html)).toBeUndefined()
    expect(html).not.toContain('data-presence')
  })

  it('adds the status to a named avatar and hides the dot from assistive tech', () => {
    const html = renderToString(
      <Avatar aria-label="Ada Lovelace" presence="away"><AvatarFallback>AL</AvatarFallback></Avatar>,
    )
    expect(html).toMatch(/^<span[^>]*role="img"[^>]*aria-label="Ada Lovelace \(Away\)"/)
    expect(html).toContain('data-presence="away"')
    const dot = presenceDot(html)
    expect(dot).toContain('aria-hidden="true"')
    expect(dot).toContain('data-status="away"')
    expect(dot).toContain('bg-warning')
  })

  it('names the dot when the avatar itself has no name', () => {
    const html = renderToString(
      <Avatar presence="online"><AvatarImage src="/a.png" alt="Ada Lovelace" /></Avatar>,
    )
    expect(html).not.toMatch(/^<span[^>]*role="img"/)
    const dot = presenceDot(html)
    expect(dot).toContain('role="img"')
    expect(dot).toContain('aria-label="Online"')
  })

  it('takes the status words from presenceLabel', () => {
    const html = renderToString(
      <Avatar aria-label="Ada" presence="busy" presenceLabel="Occupée"><AvatarFallback>A</AvatarFallback></Avatar>,
    )
    expect(html).toContain('aria-label="Ada (Occupée)"')
  })

  it('sizes and places the dot for the avatar size and shape', () => {
    const circle = presenceDot(renderToString(<Avatar size="xl" presence="online" />))
    expect(circle).toContain('h-4 w-4')
    expect(circle).toContain('bottom-0 end-0')
    const square = presenceDot(renderToString(<Avatar size="xs" shape="square" presence="online" />))
    expect(square).toContain('h-2 w-2')
    expect(square).toContain('-bottom-0.5 -end-0.5')
  })

  it('draws the dot after the image and fallback, so it paints over them', () => {
    const html = renderToString(
      <Avatar presence="online">
        <AvatarImage src="/a.png" alt="" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    )
    expect(html.indexOf('data-slot="avatar-presence"')).toBeGreaterThan(html.indexOf('AL'))
    expect(html.indexOf('data-slot="avatar-presence"')).toBeGreaterThan(html.indexOf('<img'))
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
    expect(html).not.toContain('role="img"')
  })
})
