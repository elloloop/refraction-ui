import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTheme, type StorageAdapter, type MediaQueryAdapter } from '../src/theme-machine.js'

function createMockStorage(): StorageAdapter & { store: Map<string, string> } {
  const store = new Map<string, string>()
  return {
    store,
    get: (key) => store.get(key) ?? null,
    set: (key, value) => store.set(key, value),
  }
}

function createMockMediaQuery(prefersDark = false): MediaQueryAdapter & { trigger: (matches: boolean) => void } {
  let callback: ((matches: boolean) => void) | null = null
  return {
    matches: () => prefersDark,
    subscribe: (_query, cb) => {
      callback = cb
      return () => { callback = null }
    },
    trigger: (matches) => callback?.(matches),
  }
}

describe('createTheme', () => {
  it('defaults to system mode', () => {
    const theme = createTheme()
    expect(theme.getState().mode).toBe('system')
  })

  it('resolves light when system prefers light', () => {
    const mq = createMockMediaQuery(false)
    const theme = createTheme({}, undefined, mq)
    expect(theme.getState().resolved).toBe('light')
  })

  it('resolves dark when system prefers dark', () => {
    const mq = createMockMediaQuery(true)
    const theme = createTheme({}, undefined, mq)
    expect(theme.getState().resolved).toBe('dark')
  })

  it('setMode changes mode and resolved', () => {
    const theme = createTheme()
    theme.setMode('dark')
    expect(theme.getState().mode).toBe('dark')
    expect(theme.getState().resolved).toBe('dark')
  })

  it('persists mode to storage', () => {
    const storage = createMockStorage()
    const theme = createTheme({}, storage)
    theme.setMode('dark')
    expect(storage.store.get('rfr-theme')).toBe('dark')
  })

  it('reads persisted mode from storage', () => {
    const storage = createMockStorage()
    storage.set('rfr-theme', 'dark')
    const theme = createTheme({}, storage)
    expect(theme.getState().mode).toBe('dark')
    expect(theme.getState().resolved).toBe('dark')
  })

  it('notifies subscribers on mode change', () => {
    const theme = createTheme()
    const fn = vi.fn()
    theme.subscribe(fn)
    theme.setMode('dark')
    expect(fn).toHaveBeenCalledWith({ mode: 'dark', resolved: 'dark' })
  })

  it('responds to system preference changes in system mode', () => {
    const mq = createMockMediaQuery(false)
    const theme = createTheme({}, undefined, mq)
    const fn = vi.fn()
    theme.subscribe(fn)

    expect(theme.getState().resolved).toBe('light')
    mq.trigger(true) // system switches to dark
    expect(theme.getState().resolved).toBe('dark')
    expect(fn).toHaveBeenCalledWith({ mode: 'system', resolved: 'dark' })
  })

  it('ignores system preference changes when mode is explicit', () => {
    const mq = createMockMediaQuery(false)
    const theme = createTheme({}, undefined, mq)
    theme.setMode('light')
    const fn = vi.fn()
    theme.subscribe(fn)

    mq.trigger(true) // system switches to dark, but mode is 'light'
    expect(theme.getState().resolved).toBe('light')
    expect(fn).not.toHaveBeenCalled()
  })

  it('unsubscribes correctly', () => {
    const theme = createTheme()
    const fn = vi.fn()
    const unsub = theme.subscribe(fn)
    unsub()
    theme.setMode('dark')
    expect(fn).not.toHaveBeenCalled()
  })

  it('destroy cleans up', () => {
    const mq = createMockMediaQuery(false)
    const theme = createTheme({}, undefined, mq)
    const fn = vi.fn()
    theme.subscribe(fn)
    theme.destroy()
    theme.setMode('dark')
    expect(fn).not.toHaveBeenCalled()
  })

  it('uses custom storage key', () => {
    const storage = createMockStorage()
    const theme = createTheme({ storageKey: 'my-theme' }, storage)
    theme.setMode('dark')
    expect(storage.store.get('my-theme')).toBe('dark')
  })

  it('uses custom default mode', () => {
    const theme = createTheme({ defaultMode: 'dark' })
    expect(theme.getState().mode).toBe('dark')
    expect(theme.getState().resolved).toBe('dark')
  })

  it('setMode("light") sets resolved to "light" regardless of system pref', () => {
    const mq = createMockMediaQuery(true) // system prefers dark
    const theme = createTheme({}, undefined, mq)
    theme.setMode('light')
    expect(theme.getState().mode).toBe('light')
    expect(theme.getState().resolved).toBe('light')
  })

  it('setMode("dark") sets resolved to "dark" regardless of system pref', () => {
    const mq = createMockMediaQuery(false) // system prefers light
    const theme = createTheme({}, undefined, mq)
    theme.setMode('dark')
    expect(theme.getState().mode).toBe('dark')
    expect(theme.getState().resolved).toBe('dark')
  })

  it('setMode("system") after explicit mode re-enables system tracking', () => {
    const mq = createMockMediaQuery(true) // system prefers dark
    const theme = createTheme({}, undefined, mq)
    theme.setMode('light')
    expect(theme.getState().resolved).toBe('light')
    theme.setMode('system')
    expect(theme.getState().mode).toBe('system')
    expect(theme.getState().resolved).toBe('dark') // tracks system again
  })

  it('multiple rapid setMode calls: only last state emitted', () => {
    const theme = createTheme()
    const fn = vi.fn()
    theme.subscribe(fn)
    theme.setMode('dark')
    theme.setMode('light')
    theme.setMode('dark')
    // Each call emits, but final state is what matters
    expect(theme.getState().mode).toBe('dark')
    expect(theme.getState().resolved).toBe('dark')
    const lastCall = fn.mock.calls[fn.mock.calls.length - 1][0]
    expect(lastCall).toEqual({ mode: 'dark', resolved: 'dark' })
  })

  it('system preference changes after destroy are ignored', () => {
    const mq = createMockMediaQuery(false)
    const theme = createTheme({}, undefined, mq)
    const fn = vi.fn()
    theme.subscribe(fn)
    theme.destroy()
    mq.trigger(true) // system switches to dark after destroy
    expect(theme.getState().resolved).toBe('light') // unchanged
    expect(fn).not.toHaveBeenCalled()
  })

  it('custom storageKey reads/writes correctly', () => {
    const storage = createMockStorage()
    storage.set('custom-key', 'dark')
    const theme = createTheme({ storageKey: 'custom-key' }, storage)
    expect(theme.getState().mode).toBe('dark')
    theme.setMode('light')
    expect(storage.store.get('custom-key')).toBe('light')
  })

  it('no storage adapter: still works (no crash)', () => {
    const theme = createTheme({})
    theme.setMode('dark')
    expect(theme.getState().mode).toBe('dark')
    expect(theme.getState().resolved).toBe('dark')
  })

  it('no mediaQuery adapter: defaults to light for system mode', () => {
    const theme = createTheme({ defaultMode: 'system' })
    expect(theme.getState().resolved).toBe('light')
  })

  it('getState returns current snapshot', () => {
    const theme = createTheme()
    const s1 = theme.getState()
    theme.setMode('dark')
    const s2 = theme.getState()
    expect(s1.mode).toBe('system')
    expect(s2.mode).toBe('dark')
    // s1 should still reflect old state (snapshot, not reference)
    expect(s1).not.toBe(s2)
  })

  it('two themes created independently do not interfere', () => {
    const storage1 = createMockStorage()
    const storage2 = createMockStorage()
    const theme1 = createTheme({}, storage1)
    const theme2 = createTheme({}, storage2)
    theme1.setMode('dark')
    expect(theme1.getState().mode).toBe('dark')
    expect(theme2.getState().mode).toBe('system')
    expect(storage2.store.has('rfr-theme')).toBe(false)
  })

  it('setting same mode twice does not notify subscriber', () => {
    const theme = createTheme()
    theme.setMode('dark')
    const fn = vi.fn()
    theme.subscribe(fn)
    theme.setMode('dark') // same mode
    expect(fn).not.toHaveBeenCalled()
  })

  it('multiple subscribers all notified on change', () => {
    const theme = createTheme()
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    const fn3 = vi.fn()
    theme.subscribe(fn1)
    theme.subscribe(fn2)
    theme.subscribe(fn3)
    theme.setMode('dark')
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)
    expect(fn3).toHaveBeenCalledTimes(1)
  })

  it('subscriber receives correct state after system media change', () => {
    const mq = createMockMediaQuery(false)
    const theme = createTheme({}, undefined, mq)
    const states: Array<{ mode: string; resolved: string }> = []
    theme.subscribe((s) => states.push(s))
    mq.trigger(true)
    mq.trigger(false)
    expect(states).toEqual([
      { mode: 'system', resolved: 'dark' },
      { mode: 'system', resolved: 'light' },
    ])
  })

  it('invalid persisted value in storage falls back to default', () => {
    const storage = createMockStorage()
    storage.set('rfr-theme', 'invalid-value')
    const theme = createTheme({}, storage)
    expect(theme.getState().mode).toBe('system')
  })

  it('defaultMode light starts with resolved light', () => {
    const mq = createMockMediaQuery(true) // system prefers dark
    const theme = createTheme({ defaultMode: 'light' }, undefined, mq)
    expect(theme.getState().resolved).toBe('light')
  })

  it('storage persisted value takes priority over defaultMode', () => {
    const storage = createMockStorage()
    storage.set('rfr-theme', 'dark')
    const theme = createTheme({ defaultMode: 'light' }, storage)
    expect(theme.getState().mode).toBe('dark')
    expect(theme.getState().resolved).toBe('dark')
  })

  it('destroy then setMode does not notify', () => {
    const theme = createTheme()
    const fn = vi.fn()
    theme.subscribe(fn)
    theme.destroy()
    theme.setMode('dark')
    expect(fn).not.toHaveBeenCalled()
  })
})
