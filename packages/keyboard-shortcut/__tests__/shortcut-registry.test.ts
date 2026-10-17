import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  ShortcutRegistry,
  SANE_DEFAULTS,
  SANE_DEFAULT_SHORTCUT_INFO,
} from '../src/keyboard-shortcut.js'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ShortcutRegistry snapshot', () => {
  it('starts empty', () => {
    expect(new ShortcutRegistry().getSnapshot()).toEqual([])
  })

  it('lists registrations in order with their keys, description and group', () => {
    const registry = new ShortcutRegistry()
    registry.register(['Meta', 's'], () => {}, { description: 'Save', group: 'File' })
    registry.register(['Ctrl', 'K'], () => {})
    expect(registry.getSnapshot()).toEqual([
      { id: 'meta+s', keys: ['Meta', 's'], description: 'Save', group: 'File' },
      { id: 'ctrl+k', keys: ['Ctrl', 'K'] },
    ])
  })

  it('keeps snapshot identity until the registry changes', () => {
    const registry = new ShortcutRegistry()
    registry.register(['Meta', 's'], () => {})
    const first = registry.getSnapshot()
    expect(registry.getSnapshot()).toBe(first)
    registry.register(['Meta', 'k'], () => {})
    expect(registry.getSnapshot()).not.toBe(first)
  })

  it('returns frozen snapshots that do not alias the caller’s keys array', () => {
    const registry = new ShortcutRegistry()
    const keys = ['Meta', 's']
    registry.register(keys, () => {})
    keys.push('x')
    const snapshot = registry.getSnapshot()
    expect(Object.isFrozen(snapshot)).toBe(true)
    expect(snapshot[0].keys).toEqual(['Meta', 's'])
  })

  it('works when subscribe / getSnapshot are detached from the instance', () => {
    const registry = new ShortcutRegistry()
    const { subscribe, getSnapshot } = registry
    const listener = vi.fn()
    subscribe(listener)
    registry.register(['Escape'], () => {})
    expect(listener).toHaveBeenCalledTimes(1)
    expect(getSnapshot()).toHaveLength(1)
  })
})

describe('ShortcutRegistry subscribe', () => {
  it('notifies on register and unregister, and stops after unsubscribe', () => {
    const registry = new ShortcutRegistry()
    const listener = vi.fn()
    const unsubscribe = registry.subscribe(listener)
    registry.register(['Meta', 's'], () => {})
    registry.unregister(['Meta', 's'])
    expect(listener).toHaveBeenCalledTimes(2)
    unsubscribe()
    registry.register(['Meta', 's'], () => {})
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('does not notify when unregistering keys that are not registered', () => {
    const registry = new ShortcutRegistry()
    const listener = vi.fn()
    registry.subscribe(listener)
    registry.unregister(['Meta', 'q'])
    expect(listener).not.toHaveBeenCalled()
  })
})

describe('ShortcutRegistry unregister', () => {
  it('matches keys regardless of order and case', () => {
    const registry = new ShortcutRegistry()
    registry.register(['Meta', 'Shift', 'z'], () => {})
    registry.unregister(['z', 'shift', 'META'])
    expect(registry.getSnapshot()).toEqual([])
  })

  it('without a handler removes the entry (original behaviour)', () => {
    const registry = new ShortcutRegistry()
    registry.register(['Meta', 's'], () => {})
    registry.unregister(['Meta', 's'])
    expect(registry.getSnapshot()).toEqual([])
  })

  it('with a stale handler leaves a newer registration of the same keys in place', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const registry = new ShortcutRegistry()
    const older = () => {}
    const newer = () => {}
    registry.register(['Meta', 'k'], older, { description: 'Old search' })
    registry.register(['Meta', 'k'], newer, { description: 'Search' })
    registry.unregister(['Meta', 'k'], older)
    expect(registry.getSnapshot()).toEqual([
      { id: 'k+meta', keys: ['Meta', 'k'], description: 'Search' },
    ])
    registry.unregister(['Meta', 'k'], newer)
    expect(registry.getSnapshot()).toEqual([])
  })

  it('still warns when the same keys are registered twice', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const registry = new ShortcutRegistry()
    registry.register(['Meta', 's'], () => {})
    registry.register(['s', 'Meta'], () => {})
    expect(warn).toHaveBeenCalledTimes(1)
  })
})

describe('SANE_DEFAULT_SHORTCUT_INFO', () => {
  it('describes and groups every SANE_DEFAULTS action', () => {
    for (const action of Object.keys(SANE_DEFAULTS)) {
      const info = SANE_DEFAULT_SHORTCUT_INFO[action]
      expect(info, action).toBeDefined()
      expect(info.description.length, action).toBeGreaterThan(0)
      expect(info.group.length, action).toBeGreaterThan(0)
    }
  })

  it('has no entries for actions that do not exist', () => {
    expect(Object.keys(SANE_DEFAULT_SHORTCUT_INFO).sort()).toEqual(Object.keys(SANE_DEFAULTS).sort())
  })
})
