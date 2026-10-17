import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { resetIdCounter } from '@refraction-ui/shared'
import {
  createToast,
  createToastManager,
  getToastAnnouncement,
  getToastPoliteness,
  isToastVariant,
  DEFAULT_TOAST_DURATION,
  type ToastVariant,
} from '../src/toast.js'
import {
  toastVariants,
  toastActionClass,
  toastCloseClass,
  toastTitleClass,
  toastDescriptionClass,
} from '../src/toast.styles.js'

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
    expect(classes).toContain('border-success/50')
    expect(classes).toContain('bg-success/10')
  })

  it('returns error variant classes', () => {
    const classes = toastVariants({ variant: 'error' })
    expect(classes).toContain('border-destructive/50')
    expect(classes).toContain('bg-destructive/10')
  })

  it('returns warning variant classes', () => {
    const classes = toastVariants({ variant: 'warning' })
    expect(classes).toContain('border-warning/50')
    expect(classes).toContain('bg-warning/10')
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


describe('determinism (injected now)', () => {
  it('pause/resume math uses the injected clock', () => {
    let tick = 10_000
    const onOpenChange = vi.fn()
    const api = createToast({ duration: 3000, onOpenChange, now: () => tick })
    api.startTimer()

    tick += 1000 // 1s elapsed on the injected clock
    api.pauseTimer()

    tick += 60_000 // injected clock jumps while paused — must not count
    api.resumeTimer()
    vi.advanceTimersByTime(1999)
    expect(onOpenChange).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('manager stamps createdAt from the injected clock', () => {
    let tick = 123_456
    const manager = createToastManager({ now: () => tick })
    manager.toast('one')
    tick = 789_012
    manager.toast('two')
    expect(manager.toasts[0]!.createdAt).toBe(123_456)
    expect(manager.toasts[1]!.createdAt).toBe(789_012)
  })
})

describe('toast options – title and action', () => {
  it('toast(message) still works with no options (backward compatible)', () => {
    const manager = createToastManager()
    manager.toast('Saved')
    const entry = manager.toasts[0]!
    expect(entry.message).toBe('Saved')
    expect(entry.variant).toBe('default')
    expect(entry.duration).toBe(DEFAULT_TOAST_DURATION)
    expect(entry).not.toHaveProperty('title')
    expect(entry).not.toHaveProperty('action')
  })

  it('toast(message, { variant, duration }) still works (backward compatible)', () => {
    const manager = createToastManager()
    manager.toast('Failed', { variant: 'error', duration: 5000 })
    expect(manager.toasts[0]).toMatchObject({ variant: 'error', duration: 5000 })
  })

  it('stores an optional title on the entry', () => {
    const manager = createToastManager()
    manager.toast('Your changes were saved', { title: 'Saved' })
    expect(manager.toasts[0]!.title).toBe('Saved')
  })

  it('stores an optional action on the entry without calling it', () => {
    const manager = createToastManager()
    const onClick = vi.fn()
    manager.toast('Message archived', { action: { label: 'Undo', onClick } })
    expect(manager.toasts[0]!.action).toEqual({ label: 'Undo', onClick })
    expect(onClick).not.toHaveBeenCalled()
  })

  it('defaults to DEFAULT_TOAST_DURATION, shared with createToast', () => {
    const manager = createToastManager()
    manager.toast('Hello')
    vi.advanceTimersByTime(DEFAULT_TOAST_DURATION - 1)
    expect(manager.toasts).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(manager.toasts).toHaveLength(0)

    const onOpenChange = vi.fn()
    const api = createToast({ onOpenChange })
    api.startTimer()
    vi.advanceTimersByTime(DEFAULT_TOAST_DURATION)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('createToastManager – pause / resume', () => {
  it('pause stops the countdown; resume finishes the time that was left', () => {
    let tick = 0
    const manager = createToastManager({ now: () => tick })
    const id = manager.toast('Hello', { duration: 3000 })

    tick += 1000
    vi.advanceTimersByTime(1000)
    manager.pause(id)

    tick += 60_000
    vi.advanceTimersByTime(60_000)
    expect(manager.toasts).toHaveLength(1)

    manager.resume(id)
    vi.advanceTimersByTime(1999)
    expect(manager.toasts).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(manager.toasts).toHaveLength(0)
  })

  it('pause is idempotent: a second pause does not lose more time', () => {
    let tick = 0
    const manager = createToastManager({ now: () => tick })
    const id = manager.toast('Hello', { duration: 3000 })
    tick += 1000
    manager.pause(id)
    tick += 1000
    manager.pause(id)
    manager.resume(id)
    vi.advanceTimersByTime(1999)
    expect(manager.toasts).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(manager.toasts).toHaveLength(0)
  })

  it('resume without a pause does not restart or extend the countdown', () => {
    const manager = createToastManager()
    const id = manager.toast('Hello', { duration: 3000 })
    vi.advanceTimersByTime(2000)
    manager.resume(id)
    vi.advanceTimersByTime(1000)
    expect(manager.toasts).toHaveLength(0)
  })

  it('resume dismisses a toast whose time ran out before it was paused', () => {
    let tick = 0
    const manager = createToastManager({ now: () => tick })
    const id = manager.toast('Hello', { duration: 1000 })
    tick += 1500 // the clock moved past the deadline before the timer fired
    manager.pause(id)
    expect(manager.toasts).toHaveLength(1)
    manager.resume(id)
    expect(manager.toasts).toHaveLength(0)
  })

  it('pause and resume are no-ops for persistent toasts and unknown ids', () => {
    const manager = createToastManager()
    const fn = vi.fn()
    const id = manager.toast('Sticky', { duration: 0 })
    manager.subscribe(fn)
    manager.pause(id)
    manager.resume(id)
    manager.pause('nonexistent-id')
    manager.resume('nonexistent-id')
    vi.advanceTimersByTime(60_000)
    expect(manager.toasts).toHaveLength(1)
    expect(fn).not.toHaveBeenCalled()
  })

  it('dismissing a paused toast removes it and leaves no timer behind', () => {
    const manager = createToastManager()
    const id = manager.toast('Hello', { duration: 3000 })
    manager.pause(id)
    manager.dismiss(id)
    expect(manager.toasts).toHaveLength(0)
    manager.resume(id)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('pausing one toast leaves the others counting down', () => {
    const manager = createToastManager()
    const paused = manager.toast('Paused', { duration: 1000 })
    manager.toast('Running', { duration: 1000 })
    manager.pause(paused)
    vi.advanceTimersByTime(1000)
    expect(manager.toasts.map((t) => t.message)).toEqual(['Paused'])
  })
})

describe('getToastPoliteness', () => {
  it('announces errors assertively', () => {
    expect(getToastPoliteness('error')).toBe('assertive')
  })

  it.each<ToastVariant>(['default', 'success', 'warning'])('announces %s politely', (variant) => {
    expect(getToastPoliteness(variant)).toBe('polite')
  })
})

describe('getToastAnnouncement', () => {
  it('is the message alone when there is no title or action', () => {
    expect(getToastAnnouncement({ message: 'Saved' })).toBe('Saved')
  })

  it('reads title, message and action label in order, closing each sentence', () => {
    expect(
      getToastAnnouncement({
        title: 'Archived',
        message: 'One conversation moved to the archive',
        action: { label: 'Undo', onClick: () => {} },
      }),
    ).toBe('Archived. One conversation moved to the archive. Undo')
  })

  it('keeps punctuation the author already wrote', () => {
    expect(
      getToastAnnouncement({
        title: 'Done!',
        message: 'Really?',
        action: { label: 'Undo', onClick: () => {} },
      }),
    ).toBe('Done! Really? Undo')
    expect(getToastAnnouncement({ title: '保存しました。', message: '元に戻せます' })).toBe(
      '保存しました。 元に戻せます',
    )
  })

  it('skips empty and whitespace-only parts', () => {
    expect(getToastAnnouncement({ title: '  ', message: ' Saved ' })).toBe('Saved')
  })
})

describe('toast part styles', () => {
  it('gives the action and dismiss buttons a keyboard-only focus ring', () => {
    for (const cls of [toastActionClass, toastCloseClass]) {
      expect(cls).toContain('focus-visible:ring-2')
      expect(cls).toContain('focus-visible:ring-ring')
      expect(cls).toContain('focus-visible:outline-none')
      expect(cls).not.toMatch(/(^|\s)focus:ring/)
    }
  })

  it('drops transitions for users who prefer reduced motion', () => {
    expect(toastVariants()).toContain('motion-reduce:transition-none')
    expect(toastActionClass).toContain('motion-reduce:transition-none')
    expect(toastCloseClass).toContain('motion-reduce:transition-none')
  })

  it('styles the title and the message under it', () => {
    expect(toastTitleClass).toContain('font-semibold')
    expect(toastDescriptionClass).toContain('text-sm')
  })
})

describe('isToastVariant', () => {
  it.each(['default', 'success', 'error', 'warning'])('accepts %s', (value) => {
    expect(isToastVariant(value)).toBe(true)
  })

  it.each([['info'], [''], ['Success'], ['toString'], ['__proto__'], [undefined], [null], [3]])(
    'rejects %j',
    (value) => {
      expect(isToastVariant(value)).toBe(false)
    },
  )
})
