import { describe, it, expect, vi } from 'vitest'
import { createAuth } from '../src/auth-machine.js'
import { createMockAdapter } from '../src/adapters/mock.js'

describe('createAuth', () => {
  it('starts in loading state then resolves', () => {
    const adapter = createMockAdapter()
    const auth = createAuth(adapter)
    // Mock adapter fires onAuthStateChange immediately with null
    expect(auth.getState().status).toBe('unauthenticated')
    auth.destroy()
  })

  it('starts authenticated with test mode', () => {
    const adapter = createMockAdapter()
    const testUser = { uid: 'test', email: 'test@test.com', displayName: 'Test', photoURL: null, roles: ['admin'] }
    const auth = createAuth(adapter, { testMode: true, testUser })
    expect(auth.getState().status).toBe('authenticated')
    expect(auth.getState().user?.email).toBe('test@test.com')
    auth.destroy()
  })

  it('signIn sets user', async () => {
    const adapter = createMockAdapter()
    const auth = createAuth(adapter)
    const user = await auth.signIn('user@test.com', 'password')
    expect(user.email).toBe('user@test.com')
    expect(auth.getState().status).toBe('authenticated')
    auth.destroy()
  })

  it('signUp sets user with display name', async () => {
    const adapter = createMockAdapter()
    const auth = createAuth(adapter)
    const user = await auth.signUp('new@test.com', 'password', 'New User')
    expect(user.displayName).toBe('New User')
    expect(auth.getState().status).toBe('authenticated')
    auth.destroy()
  })

  it('signOut clears user', async () => {
    const adapter = createMockAdapter()
    const auth = createAuth(adapter)
    await auth.signIn('user@test.com', 'password')
    expect(auth.getState().status).toBe('authenticated')
    await auth.signOut()
    expect(auth.getState().status).toBe('unauthenticated')
    expect(auth.getState().user).toBeNull()
    auth.destroy()
  })

  it('getToken returns token when authenticated', async () => {
    const adapter = createMockAdapter()
    const auth = createAuth(adapter)
    await auth.signIn('user@test.com', 'password')
    const token = await auth.getToken()
    expect(token).toContain('mock-token')
    auth.destroy()
  })

  it('getToken returns null when unauthenticated', async () => {
    const adapter = createMockAdapter()
    const auth = createAuth(adapter)
    const token = await auth.getToken()
    expect(token).toBeNull()
    auth.destroy()
  })

  it('notifies subscribers on state change', async () => {
    const adapter = createMockAdapter()
    const auth = createAuth(adapter)
    const fn = vi.fn()
    auth.subscribe(fn)
    await auth.signIn('user@test.com', 'password')
    expect(fn).toHaveBeenCalled()
    expect(fn.mock.calls[fn.mock.calls.length - 1][0].status).toBe('authenticated')
    auth.destroy()
  })

  it('unsubscribes correctly', async () => {
    const adapter = createMockAdapter()
    const auth = createAuth(adapter)
    const fn = vi.fn()
    const unsub = auth.subscribe(fn)
    unsub()
    await auth.signIn('user@test.com', 'password')
    expect(fn).not.toHaveBeenCalled()
    auth.destroy()
  })

  it('destroy cleans up', async () => {
    const adapter = createMockAdapter()
    const auth = createAuth(adapter)
    const fn = vi.fn()
    auth.subscribe(fn)
    auth.destroy()
    // After destroy, signIn should still work but not notify
    await auth.signIn('user@test.com', 'password')
    expect(fn).not.toHaveBeenCalled()
  })

  it('signInWithOAuth sets user', async () => {
    const adapter = createMockAdapter()
    const auth = createAuth(adapter)
    const user = await auth.signInWithOAuth('google')
    expect(user.email).toBe('oauth@example.com')
    expect(user.displayName).toBe('OAuth User')
    expect(auth.getState().status).toBe('authenticated')
    auth.destroy()
  })

  it('multiple signIn/signOut cycles', async () => {
    const adapter = createMockAdapter()
    const auth = createAuth(adapter)

    await auth.signIn('a@test.com', 'pw')
    expect(auth.getState().status).toBe('authenticated')
    await auth.signOut()
    expect(auth.getState().status).toBe('unauthenticated')

    await auth.signIn('b@test.com', 'pw')
    expect(auth.getState().status).toBe('authenticated')
    expect(auth.getState().user?.email).toBe('b@test.com')
    await auth.signOut()
    expect(auth.getState().status).toBe('unauthenticated')
    auth.destroy()
  })

  it('subscriber receives all state transitions', async () => {
    const adapter = createMockAdapter()
    const auth = createAuth(adapter)
    const fn = vi.fn()
    auth.subscribe(fn)

    await auth.signIn('user@test.com', 'password')
    await auth.signOut()

    // Should have received at least: signIn notification + adapter notify, signOut notification + adapter notify
    const statuses = fn.mock.calls.map((c) => c[0].status)
    expect(statuses).toContain('authenticated')
    expect(statuses).toContain('unauthenticated')
    auth.destroy()
  })

  it('multiple subscribers all notified', async () => {
    const adapter = createMockAdapter()
    const auth = createAuth(adapter)
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    auth.subscribe(fn1)
    auth.subscribe(fn2)

    await auth.signIn('user@test.com', 'password')
    expect(fn1).toHaveBeenCalled()
    expect(fn2).toHaveBeenCalled()
    auth.destroy()
  })

  it('getToken after signOut returns null', async () => {
    const adapter = createMockAdapter()
    const auth = createAuth(adapter)
    await auth.signIn('user@test.com', 'password')
    await auth.signOut()
    const token = await auth.getToken()
    expect(token).toBeNull()
    auth.destroy()
  })

  it('resetPassword does not change auth state', async () => {
    const adapter = createMockAdapter()
    const auth = createAuth(adapter)
    expect(auth.getState().status).toBe('unauthenticated')
    await auth.resetPassword('user@test.com')
    expect(auth.getState().status).toBe('unauthenticated')
    expect(auth.getState().user).toBeNull()
    auth.destroy()
  })

  it('concurrent signIn calls: second should win', async () => {
    const adapter = createMockAdapter()
    const auth = createAuth(adapter)
    const [user1, user2] = await Promise.all([
      auth.signIn('first@test.com', 'pw'),
      auth.signIn('second@test.com', 'pw'),
    ])
    // Both resolve, but the last one to set state wins
    expect(auth.getState().user?.email).toBe('second@test.com')
    auth.destroy()
  })
})
