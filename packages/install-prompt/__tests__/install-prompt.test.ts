import { describe, it, expect } from 'vitest'
import { createInstallPrompt, type StorageAdapter } from '../src/install-prompt.js'
import { installPromptVariants } from '../src/install-prompt.styles.js'

function createMockStorage(initial: Record<string, string> = {}): StorageAdapter {
  const store = { ...initial }
  return {
    get(key) {
      return store[key] ?? null
    },
    set(key, value) {
      store[key] = value
    },
  }
}

describe('createInstallPrompt', () => {
  it('initializes with canShow=false and isDismissed=false', () => {
    const api = createInstallPrompt()
    expect(api.state.canShow).toBe(false)
    expect(api.state.isDismissed).toBe(false)
  })

  it('reads dismissed state from storage', () => {
    const storage = createMockStorage({ 'rfr-install-dismissed': 'true' })
    const api = createInstallPrompt({}, storage)
    expect(api.state.isDismissed).toBe(true)
  })

  it('uses custom storageKey', () => {
    const storage = createMockStorage({ 'my-key': 'true' })
    const api = createInstallPrompt({ storageKey: 'my-key' }, storage)
    expect(api.state.isDismissed).toBe(true)
  })

  it('show sets canShow to true when not dismissed', () => {
    const api = createInstallPrompt()
    api.show()
    expect(api.state.canShow).toBe(true)
  })

  it('show does not set canShow when dismissed', () => {
    const storage = createMockStorage({ 'rfr-install-dismissed': 'true' })
    const api = createInstallPrompt({}, storage)
    api.show()
    expect(api.state.canShow).toBe(false)
  })

  it('dismiss sets canShow=false and isDismissed=true', () => {
    const api = createInstallPrompt()
    api.show()
    api.dismiss()
    expect(api.state.canShow).toBe(false)
    expect(api.state.isDismissed).toBe(true)
  })

  it('dismiss persists to storage', () => {
    const storage = createMockStorage()
    const api = createInstallPrompt({}, storage)
    api.dismiss()
    expect(storage.get('rfr-install-dismissed')).toBe('true')
  })

  it('install calls prompt on the event object', () => {
    let called = false
    const api = createInstallPrompt()
    api.show()
    api.install({ prompt: () => { called = true } })
    expect(called).toBe(true)
    expect(api.state.canShow).toBe(false)
  })

  it('install handles missing prompt event', () => {
    const api = createInstallPrompt()
    api.show()
    api.install()
    expect(api.state.canShow).toBe(false)
  })

  it('provides correct ariaProps', () => {
    const api = createInstallPrompt()
    expect(api.ariaProps.role).toBe('banner')
    expect(api.ariaProps['aria-label']).toBe('Install application')
  })
})

describe('installPromptVariants', () => {
  it('returns base banner styles', () => {
    const classes = installPromptVariants()
    expect(classes).toContain('fixed')
    expect(classes).toContain('bottom-0')
  })
})
