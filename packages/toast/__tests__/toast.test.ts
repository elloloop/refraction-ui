import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { resetIdCounter } from '@elloloop/shared'
import { createToast, createToastManager } from '../src/toast.js'
import { toastVariants } from '../src/toast.styles.js'

beforeEach(() => {
  resetIdCounter()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('createToast', () => {
  it('defaults to open state with default variant', () => {
    const api = createToast()
    expect(api.state.open).toBe(true)
    expect(api.state.variant).toBe('default')
  })

  it('respects variant prop', () => {
    const api = createToast({ variant: 'success' })
    expect(api.state.variant).toBe('success')
  })

  it('respects controlled open prop', () => {
    const api = createToast({ open: false })
    expect(api.state.open).toBe(false)
  })

  it('provides correct ARIA props', () => {
    const api = createToast()
    expect(api.ariaProps.role).toBe('alert')
    expect(api.ariaProps['aria-live']).toBe('assertive')
    expect(api.ariaProps['aria-atomic']).toBe(true)
  })
})

describe('toast dismiss', () => {
  it('dismiss sets open to false and calls onOpenChange', () => {
    const onOpenChange = vi.fn()
    const api = createToast({ onOpenChange })
    api.dismiss()
    expect(api.state.open).toBe(false)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('toast timer management', () => {
  it('auto-dismisses after duration', () => {
    const onOpenChange = vi.fn()
    const api = createToast({ duration: 3000, onOpenChange })
    api.startTimer()
    vi.advanceTimersByTime(3000)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(api.state.open).toBe(false)
  })

  it('does not auto-dismiss when duration is 0', () => {
    const onOpenChange = vi.fn()
    const api = createToast({ duration: 0, onOpenChange })
    api.startTimer()
    vi.advanceTimersByTime(10000)
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(api.state.open).toBe(true)
  })

  it('pauses and resumes timer', () => {
    const onOpenChange = vi.fn()
    const api = createToast({ duration: 3000, onOpenChange })
    api.startTimer()

    // Advance 1000ms then pause
    vi.advanceTimersByTime(1000)
    api.pauseTimer()

    // Advance a lot — should not dismiss
    vi.advanceTimersByTime(5000)
    expect(onOpenChange).not.toHaveBeenCalled()

    // Resume — remaining ~2000ms
    api.resumeTimer()
    vi.advanceTimersByTime(2000)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('dismiss clears any pending timer', () => {
    const onOpenChange = vi.fn()
    const api = createToast({ duration: 3000, onOpenChange })
    api.startTimer()
    api.dismiss()
    expect(onOpenChange).toHaveBeenCalledTimes(1)

    // Timer should be cleared, no second call
    vi.advanceTimersByTime(5000)
    expect(onOpenChange).toHaveBeenCalledTimes(1)
  })
})

describe('createToastManager', () => {
  it('starts with empty toast list', () => {
    const manager = createToastManager()
    expect(manager.toasts).toHaveLength(0)
  })

  it('adds a toast and returns an id', () => {
    const manager = createToastManager()
    const id = manager.toast('Hello')
    expect(id).toMatch(/^rfr-toast-/)
    expect(manager.toasts).toHaveLength(1)
    expect(manager.toasts[0].message).toBe('Hello')
    expect(manager.toasts[0].variant).toBe('default')
  })

  it('adds toast with custom variant and duration', () => {
    const manager = createToastManager()
    manager.toast('Error!', { variant: 'error', duration: 5000 })
    expect(manager.toasts[0].variant).toBe('error')
    expect(manager.toasts[0].duration).toBe(5000)
  })

  it('dismisses a toast by id', () => {
    const manager = createToastManager()
    const id = manager.toast('Hello')
    expect(manager.toasts).toHaveLength(1)
    manager.dismiss(id)
    expect(manager.toasts).toHaveLength(0)
  })

  it('auto-dismisses after duration', () => {
    const manager = createToastManager()
    manager.toast('Auto', { duration: 2000 })
    expect(manager.toasts).toHaveLength(1)
    vi.advanceTimersByTime(2000)
    expect(manager.toasts).toHaveLength(0)
  })

  it('does not auto-dismiss when duration is 0', () => {
    const manager = createToastManager()
    manager.toast('Sticky', { duration: 0 })
    vi.advanceTimersByTime(10000)
    expect(manager.toasts).toHaveLength(1)
  })

  it('notifies subscribers on toast add', () => {
    const manager = createToastManager()
    const fn = vi.fn()
    manager.subscribe(fn)
    manager.toast('Hello')
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ message: 'Hello' })]),
    )
  })

  it('notifies subscribers on toast dismiss', () => {
    const manager = createToastManager()
    const fn = vi.fn()
    const id = manager.toast('Hello')
    manager.subscribe(fn)
    manager.dismiss(id)
    expect(fn).toHaveBeenCalledWith([])
  })

  it('unsubscribe stops notifications', () => {
    const manager = createToastManager()
    const fn = vi.fn()
    const unsub = manager.subscribe(fn)
    unsub()
    manager.toast('Hello')
    expect(fn).not.toHaveBeenCalled()
  })

  it('manages multiple toasts', () => {
    const manager = createToastManager()
    const id1 = manager.toast('First')
    const id2 = manager.toast('Second')
    expect(manager.toasts).toHaveLength(2)
    manager.dismiss(id1)
    expect(manager.toasts).toHaveLength(1)
    expect(manager.toasts[0].id).toBe(id2)
  })
})

describe('toast styles', () => {
  it('returns default variant classes', () => {
    const classes = toastVariants()
    expect(classes).toContain('rounded-lg')
    expect(classes).toContain('bg-background')
  })

  it('returns success variant classes', () => {
    const classes = toastVariants({ variant: 'success' })
    expect(classes).toContain('border-green-500/50')
    expect(classes).toContain('bg-green-50')
  })

  it('returns error variant classes', () => {
    const classes = toastVariants({ variant: 'error' })
    expect(classes).toContain('border-red-500/50')
    expect(classes).toContain('bg-red-50')
  })

  it('returns warning variant classes', () => {
    const classes = toastVariants({ variant: 'warning' })
    expect(classes).toContain('border-amber-500/50')
    expect(classes).toContain('bg-amber-50')
  })

  it('appends custom className', () => {
    const classes = toastVariants({ className: 'my-custom' })
    expect(classes).toContain('my-custom')
  })
})

// ---------------------------------------------------------------
// Additional tests
// ---------------------------------------------------------------

describe('createToast – additional state / aria coverage', () => {
  it('ariaProps has role="alert"', () => {
    const api = createToast()
    expect(api.ariaProps.role).toBe('alert')
  })

  it('ariaProps has aria-live="assertive"', () => {
    const api = createToast()
    expect(api.ariaProps['aria-live']).toBe('assertive')
  })

  it('ariaProps has aria-atomic=true', () => {
    const api = createToast()
    expect(api.ariaProps['aria-atomic']).toBe(true)
  })

  it('state.variant reflects "success"', () => {
    const api = createToast({ variant: 'success' })
    expect(api.state.variant).toBe('success')
  })

  it('state.variant reflects "error"', () => {
    const api = createToast({ variant: 'error' })
    expect(api.state.variant).toBe('error')
  })

  it('state.variant reflects "warning"', () => {
    const api = createToast({ variant: 'warning' })
    expect(api.state.variant).toBe('warning')
  })

  it('state.variant reflects "default" when omitted', () => {
    const api = createToast()
    expect(api.state.variant).toBe('default')
  })
})

describe('createToast – timer edge-cases', () => {
  it('pause, wait, resume: dismiss happens after remaining time', () => {
    const onOpenChange = vi.fn()
    const api = createToast({ duration: 4000, onOpenChange })
    api.startTimer()

    // Advance 1500ms, then pause
    vi.advanceTimersByTime(1500)
    api.pauseTimer()

    // Advance a long time while paused — should NOT dismiss
    vi.advanceTimersByTime(10000)
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(api.state.open).toBe(true)

    // Resume — remaining ~2500ms
    api.resumeTimer()

    // Not yet
    vi.advanceTimersByTime(2000)
    expect(onOpenChange).not.toHaveBeenCalled()

    // Now it should fire (total of 2500ms since resume)
    vi.advanceTimersByTime(500)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(api.state.open).toBe(false)
  })

  it('dismiss cancels any running timer so it does not fire again', () => {
    const onOpenChange = vi.fn()
    const api = createToast({ duration: 5000, onOpenChange })
    api.startTimer()

    vi.advanceTimersByTime(1000)
    api.dismiss()
    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)

    // Timer should not fire again
    vi.advanceTimersByTime(10000)
    expect(onOpenChange).toHaveBeenCalledTimes(1)
  })

  it('duration=0 means no auto-dismiss even after a long time', () => {
    const onOpenChange = vi.fn()
    const api = createToast({ duration: 0, onOpenChange })
    api.startTimer()
    vi.advanceTimersByTime(60000)
    expect(api.state.open).toBe(true)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('resumeTimer is a no-op when duration is 0', () => {
    const onOpenChange = vi.fn()
    const api = createToast({ duration: 0, onOpenChange })
    api.resumeTimer()
    vi.advanceTimersByTime(10000)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('pauseTimer is a no-op when no timer is running', () => {
    const api = createToast({ duration: 3000 })
    // Should not throw
    expect(() => api.pauseTimer()).not.toThrow()
  })
})

describe('createToastManager – additional coverage', () => {
  it('multiple rapid toasts do not interfere with each other', () => {
    const manager = createToastManager()
    const id1 = manager.toast('A', { duration: 1000 })
    const id2 = manager.toast('B', { duration: 2000 })
    const id3 = manager.toast('C', { duration: 3000 })
    expect(manager.toasts).toHaveLength(3)

    vi.advanceTimersByTime(1000)
    expect(manager.toasts).toHaveLength(2)
    expect(manager.toasts.find((t) => t.id === id1)).toBeUndefined()

    vi.advanceTimersByTime(1000)
    expect(manager.toasts).toHaveLength(1)
    expect(manager.toasts.find((t) => t.id === id2)).toBeUndefined()

    vi.advanceTimersByTime(1000)
    expect(manager.toasts).toHaveLength(0)
  })

  it('dismiss with non-existent id is a no-op', () => {
    const manager = createToastManager()
    manager.toast('Hello')
    expect(manager.toasts).toHaveLength(1)
    // Dismissing a made-up id should not throw or affect existing toasts
    expect(() => manager.dismiss('nonexistent-id')).not.toThrow()
    expect(manager.toasts).toHaveLength(1)
  })

  it('dismiss with non-existent id still notifies subscribers', () => {
    const manager = createToastManager()
    manager.toast('Hello')
    const fn = vi.fn()
    manager.subscribe(fn)
    manager.dismiss('nonexistent-id')
    // subscriber is called because notify() always runs
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('each toast gets a unique id', () => {
    const manager = createToastManager()
    const ids = Array.from({ length: 10 }, (_, i) => manager.toast(`Toast ${i}`))
    const unique = new Set(ids)
    expect(unique.size).toBe(10)
  })

  it('toasts preserve insertion order', () => {
    const manager = createToastManager()
    manager.toast('First')
    manager.toast('Second')
    manager.toast('Third')
    expect(manager.toasts[0].message).toBe('First')
    expect(manager.toasts[1].message).toBe('Second')
    expect(manager.toasts[2].message).toBe('Third')
  })
})

describe('toastVariants – all 4 variants produce distinct classes', () => {
  it('default, success, error, warning all differ', () => {
    const def = toastVariants({ variant: 'default' })
    const suc = toastVariants({ variant: 'success' })
    const err = toastVariants({ variant: 'error' })
    const warn = toastVariants({ variant: 'warning' })

    const all = [def, suc, err, warn]
    // Each should be a unique string
    expect(new Set(all).size).toBe(4)
  })

  it('all variants share the base rounded-lg class', () => {
    const variants = ['default', 'success', 'error', 'warning'] as const
    for (const v of variants) {
      expect(toastVariants({ variant: v })).toContain('rounded-lg')
    }
  })
})
