import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { PageHeader } from '../src/page-header.js'

const render = (props: React.ComponentProps<typeof PageHeader>) =>
  renderToString(React.createElement(PageHeader, props))

describe('PageHeader (SSR)', () => {
  it('renders a header with the title as an h1 by default', () => {
    const html = render({ title: 'Projects' })
    expect(html).toMatch(/^<header/)
    expect(html).toContain('data-slot="page-header"')
    expect(html).toMatch(/<h1[^>]*>Projects<\/h1>/)
  })

  it('honours the heading level', () => {
    expect(render({ title: 'Members', as: 'h2' })).toMatch(/<h2[^>]*>Members<\/h2>/)
  })

  it('renders kicker and description when given', () => {
    const html = render({ title: 'T', kicker: 'Workspace', description: 'Manage your projects.' })
    expect(html).toContain('Workspace')
    expect(html).toContain('Manage your projects.')
  })

  it('omits the actions row unless actions are given', () => {
    expect(render({ title: 'T' })).toContain('data-has-actions="false"')
    const html = render({
      title: 'T',
      actions: React.createElement('button', { type: 'button' }, 'New project'),
    })
    expect(html).toContain('data-has-actions="true"')
    expect(html).toContain('New project')
  })

  it('merges className and passes through attributes', () => {
    const html = render({ title: 'T', className: 'extra', id: 'top' })
    expect(html).toContain('extra')
    expect(html).toContain('id="top"')
  })
})
