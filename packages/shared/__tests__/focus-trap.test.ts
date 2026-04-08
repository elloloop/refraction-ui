import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  FOCUSABLE_SELECTOR,
  getFocusableElements,
  createFocusTrap,
} from '../src/focus-trap.js'

describe('FOCUSABLE_SELECTOR', () => {
  it('includes anchor elements with href', () => {
    expect(FOCUSABLE_SELECTOR).toContain('a[href]')
  })

  it('includes buttons that are not disabled', () => {
    expect(FOCUSABLE_SELECTOR).toContain('button:not([disabled])')
  })

  it('includes inputs that are not disabled', () => {
    expect(FOCUSABLE_SELECTOR).toContain('input:not([disabled])')
  })

  it('includes selects that are not disabled', () => {
    expect(FOCUSABLE_SELECTOR).toContain('select:not([disabled])')
  })

  it('includes textareas that are not disabled', () => {
    expect(FOCUSABLE_SELECTOR).toContain('textarea:not([disabled])')
  })

  it('includes elements with tabindex but excludes tabindex="-1"', () => {
    expect(FOCUSABLE_SELECTOR).toContain('[tabindex]:not([tabindex="-1"])')
  })
})

describe('getFocusableElements', () => {
  it('calls querySelectorAll with the focusable selector', () => {
    const mockElements = [{}, {}]
    const mockContainer = {
      querySelectorAll: vi.fn().mockReturnValue(mockElements),
    } as unknown as Element

    const result = getFocusableElements(mockContainer)

    expect(mockContainer.querySelectorAll).toHaveBeenCalledWith(
      FOCUSABLE_SELECTOR,
    )
    expect(result).toEqual(mockElements)
  })

  it('returns empty array when no focusable elements exist', () => {
    const mockContainer = {
      querySelectorAll: vi.fn().mockReturnValue([]),
    } as unknown as Element

    const result = getFocusableElements(mockContainer)
    expect(result).toEqual([])
  })
})

describe('createFocusTrap', () => {
  it('returns an object with activate, deactivate, and isActive methods', () => {
    const mockContainer = {
      querySelectorAll: vi.fn().mockReturnValue([]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Element

    const trap = createFocusTrap({ container: mockContainer })

    expect(typeof trap.activate).toBe('function')
    expect(typeof trap.deactivate).toBe('function')
    expect(typeof trap.isActive).toBe('function')
  })

  it('starts as inactive', () => {
    const mockContainer = {
      querySelectorAll: vi.fn().mockReturnValue([]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Element

    const trap = createFocusTrap({ container: mockContainer })
    expect(trap.isActive()).toBe(false)
  })

  it('becomes active after activate()', () => {
    const mockContainer = {
      querySelectorAll: vi.fn().mockReturnValue([]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Element

    const trap = createFocusTrap({ container: mockContainer })
    trap.activate()
    expect(trap.isActive()).toBe(true)
  })

  it('becomes inactive after deactivate()', () => {
    const mockContainer = {
      querySelectorAll: vi.fn().mockReturnValue([]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Element

    const trap = createFocusTrap({ container: mockContainer })
    trap.activate()
    trap.deactivate()
    expect(trap.isActive()).toBe(false)
  })

  it('adds keydown listener on activate', () => {
    const mockContainer = {
      querySelectorAll: vi.fn().mockReturnValue([]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Element

    const trap = createFocusTrap({ container: mockContainer })
    trap.activate()

    expect(mockContainer.addEventListener).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
    )
  })

  it('removes keydown listener on deactivate', () => {
    const mockContainer = {
      querySelectorAll: vi.fn().mockReturnValue([]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Element

    const trap = createFocusTrap({ container: mockContainer })
    trap.activate()
    trap.deactivate()

    expect(mockContainer.removeEventListener).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
    )
  })

  it('focuses initialFocus target on activate', () => {
    const mockTarget = { focus: vi.fn() }
    const mockContainer = {
      querySelectorAll: vi.fn().mockReturnValue([]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Element

    const trap = createFocusTrap({
      container: mockContainer,
      initialFocus: () => mockTarget as unknown as Element,
    })
    trap.activate()

    expect(mockTarget.focus).toHaveBeenCalled()
  })

  it('focuses first focusable element when no initialFocus provided', () => {
    const mockFirst = { focus: vi.fn() }
    const mockContainer = {
      querySelectorAll: vi.fn().mockReturnValue([mockFirst]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Element

    const trap = createFocusTrap({ container: mockContainer })
    trap.activate()

    expect(mockFirst.focus).toHaveBeenCalled()
  })

  it('does not double-activate', () => {
    const mockContainer = {
      querySelectorAll: vi.fn().mockReturnValue([]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Element

    const trap = createFocusTrap({ container: mockContainer })
    trap.activate()
    trap.activate()

    expect(mockContainer.addEventListener).toHaveBeenCalledTimes(1)
  })

  it('does not double-deactivate', () => {
    const mockContainer = {
      querySelectorAll: vi.fn().mockReturnValue([]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Element

    const trap = createFocusTrap({ container: mockContainer })
    trap.activate()
    trap.deactivate()
    trap.deactivate()

    expect(mockContainer.removeEventListener).toHaveBeenCalledTimes(1)
  })

  it('accepts optional onEscape callback', () => {
    const onEscape = vi.fn()
    const mockContainer = {
      querySelectorAll: vi.fn().mockReturnValue([]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Element

    const trap = createFocusTrap({
      container: mockContainer,
      onEscape,
    })

    // Trap should be creatable with onEscape
    expect(trap).toBeDefined()
  })

  it('accepts optional returnFocusOnDeactivate', () => {
    const mockContainer = {
      querySelectorAll: vi.fn().mockReturnValue([]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Element

    const trap = createFocusTrap({
      container: mockContainer,
      returnFocusOnDeactivate: false,
    })

    expect(trap).toBeDefined()
  })
})
