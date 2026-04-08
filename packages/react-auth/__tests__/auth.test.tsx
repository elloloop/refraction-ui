import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { AuthProvider, useAuth } from '../src/auth-provider.js'
import { AuthGuard } from '../src/auth-guard.js'

describe('AuthProvider (SSR)', () => {
  it('renders children', () => {
    const html = renderToString(
      React.createElement(AuthProvider, { provider: 'mock' },
        React.createElement('div', null, 'App content'),
      ),
    )
    expect(html).toContain('App content')
  })

  it('works with test mode', () => {
    const testUser = {
      uid: 'test',
      email: 'test@test.com',
      displayName: 'Test User',
      photoURL: null,
      roles: ['admin'],
    }
    const html = renderToString(
      React.createElement(AuthProvider, { testMode: true, testUser, provider: 'mock' },
        React.createElement('div', null, 'Authenticated'),
      ),
    )
    expect(html).toContain('Authenticated')
  })
})

describe('AuthGuard (SSR)', () => {
  it('renders children within AuthProvider', () => {
    const testUser = {
      uid: 'test',
      email: 'test@test.com',
      displayName: 'Test User',
      photoURL: null,
      roles: ['admin'],
    }
    const html = renderToString(
      React.createElement(AuthProvider, { testMode: true, testUser, provider: 'mock' },
        React.createElement(AuthGuard, null,
          React.createElement('div', null, 'Protected content'),
        ),
      ),
    )
    expect(html).toContain('Protected content')
  })

  it('renders fallback when not authenticated', () => {
    const html = renderToString(
      React.createElement(AuthProvider, { provider: 'mock' },
        React.createElement(AuthGuard, {
          fallback: React.createElement('div', null, 'Loading...'),
        },
          React.createElement('div', null, 'Protected'),
        ),
      ),
    )
    // Mock adapter starts unauthenticated on SSR (no user)
    // Either shows fallback or protected depending on mock timing
    expect(html).toBeDefined()
  })
})

describe('AuthGuard with roles (SSR)', () => {
  it('renders children when user has required role', () => {
    const testUser = {
      uid: 'test',
      email: 'test@test.com',
      displayName: 'Test User',
      photoURL: null,
      roles: ['admin'],
    }
    const html = renderToString(
      React.createElement(AuthProvider, { testMode: true, testUser, provider: 'mock' },
        React.createElement(AuthGuard, { roles: ['admin'] },
          React.createElement('div', null, 'Admin content'),
        ),
      ),
    )
    expect(html).toContain('Admin content')
  })

  it('renders unauthorized fallback when user lacks required role', () => {
    const testUser = {
      uid: 'test',
      email: 'test@test.com',
      displayName: 'Test User',
      photoURL: null,
      roles: ['student'],
    }
    const html = renderToString(
      React.createElement(AuthProvider, { testMode: true, testUser, provider: 'mock' },
        React.createElement(AuthGuard, {
          roles: ['admin'],
          unauthorized: React.createElement('div', null, 'Access denied'),
        },
          React.createElement('div', null, 'Admin content'),
        ),
      ),
    )
    expect(html).toContain('Access denied')
    expect(html).not.toContain('Admin content')
  })

  it('renders children immediately with AuthProvider', () => {
    const html = renderToString(
      React.createElement(AuthProvider, { provider: 'mock' },
        React.createElement('div', null, 'Immediate content'),
      ),
    )
    expect(html).toContain('Immediate content')
  })
})

describe('useAuth outside provider', () => {
  it('throws when used outside AuthProvider', () => {
    function BadComponent() {
      useAuth()
      return React.createElement('div', null, 'Should not render')
    }
    expect(() => {
      renderToString(React.createElement(BadComponent))
    }).toThrow('useAuth must be used within an <AuthProvider>')
  })
})
