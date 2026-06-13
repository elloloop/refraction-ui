import { describe, it, expect } from 'vitest'
import { splitUrl, createBrowserChromeMock } from '../src/index.js'

describe('splitUrl', () => {
  it('splits a URL with a path into domain and path', () => {
    const { domain, path } = splitUrl('loopwyse.com/r/7k2f')
    expect(domain).toBe('loopwyse.com')
    expect(path).toBe('/r/7k2f')
  })

  it('returns empty path when no slash is present', () => {
    const { domain, path } = splitUrl('loopwyse.com')
    expect(domain).toBe('loopwyse.com')
    expect(path).toBe('')
  })

  it('handles a bare slash (root path)', () => {
    const { domain, path } = splitUrl('loopwyse.com/')
    expect(domain).toBe('loopwyse.com')
    expect(path).toBe('/')
  })
})

describe('createBrowserChromeMock', () => {
  it('always returns role=group and aria-label=Browser preview', () => {
    const { ariaProps } = createBrowserChromeMock()
    expect(ariaProps.role).toBe('group')
    expect(ariaProps['aria-label']).toBe('Browser preview')
  })

  it('omits data-status when no status is provided', () => {
    const { dataAttributes } = createBrowserChromeMock()
    expect(dataAttributes['data-status']).toBeUndefined()
  })

  it('sets data-status=live when status is live', () => {
    const { dataAttributes } = createBrowserChromeMock({ status: 'live' })
    expect(dataAttributes['data-status']).toBe('live')
  })

  it('sets data-status=rec when status is rec', () => {
    const { dataAttributes } = createBrowserChromeMock({ status: 'rec' })
    expect(dataAttributes['data-status']).toBe('rec')
  })
})
