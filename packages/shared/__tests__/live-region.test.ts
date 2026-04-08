import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createLiveRegion } from '../src/live-region.js'

// Mock DOM APIs since we run in node environment
function setupDOMMocks() {
  const mockElement = {
    setAttribute: vi.fn(),
    style: {} as Record<string, string>,
    textContent: '',
    parentNode: {
      removeChild: vi.fn(),
    },
  }

  const originalDocument = globalThis.document
  const originalRAF = globalThis.requestAnimationFrame

  // @ts-expect-error - partial mock
  globalThis.document = {
    createElement: vi.fn().mockReturnValue(mockElement),
    body: {
      appendChild: vi.fn(),
    },
    activeElement: null,
  }

  globalThis.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
    cb(0)
    return 0
  })

  return {
    mockElement,
    cleanup() {
      if (originalDocument) {
        globalThis.document = originalDocument
      }
      globalThis.requestAnimationFrame = originalRAF
    },
  }
}

describe('createLiveRegion', () => {
  let mocks: ReturnType<typeof setupDOMMocks>

  beforeEach(() => {
    mocks = setupDOMMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    mocks.cleanup()
    vi.useRealTimers()
  })

  it('returns an object with announce, clear, and destroy methods', () => {
    const region = createLiveRegion()
    expect(typeof region.announce).toBe('function')
    expect(typeof region.clear).toBe('function')
    expect(typeof region.destroy).toBe('function')
  })

  it('creates a DOM element with aria-live on first announce', () => {
    const region = createLiveRegion()
    region.announce('Hello')

    expect(document.createElement).toHaveBeenCalledWith('div')
    expect(mocks.mockElement.setAttribute).toHaveBeenCalledWith(
      'aria-live',
      'polite',
    )
    expect(mocks.mockElement.setAttribute).toHaveBeenCalledWith(
      'aria-atomic',
      'true',
    )
    expect(mocks.mockElement.setAttribute).toHaveBeenCalledWith(
      'role',
      'status',
    )
  })

  it('uses assertive politeness when configured', () => {
    const region = createLiveRegion({ politeness: 'assertive' })
    region.announce('Urgent')

    expect(mocks.mockElement.setAttribute).toHaveBeenCalledWith(
      'aria-live',
      'assertive',
    )
  })

  it('sets the text content on announce', () => {
    const region = createLiveRegion()
    region.announce('Test message')

    expect(mocks.mockElement.textContent).toBe('Test message')
  })

  it('appends the element to document.body', () => {
    const region = createLiveRegion()
    region.announce('Hello')

    expect(document.body.appendChild).toHaveBeenCalledWith(mocks.mockElement)
  })

  it('clear() empties the text content', () => {
    const region = createLiveRegion()
    region.announce('Hello')
    mocks.mockElement.textContent = 'Hello'
    region.clear()

    expect(mocks.mockElement.textContent).toBe('')
  })

  it('destroy() removes the element from DOM', () => {
    const region = createLiveRegion()
    region.announce('Hello')
    region.destroy()

    expect(mocks.mockElement.parentNode.removeChild).toHaveBeenCalledWith(
      mocks.mockElement,
    )
  })

  it('auto-clears after the configured timeout', () => {
    const region = createLiveRegion({ clearAfterMs: 3000 })
    region.announce('Hello')
    mocks.mockElement.textContent = 'Hello'

    vi.advanceTimersByTime(3000)
    expect(mocks.mockElement.textContent).toBe('')
  })

  it('defaults clearAfterMs to 5000', () => {
    const region = createLiveRegion()
    region.announce('Hello')
    mocks.mockElement.textContent = 'Hello'

    vi.advanceTimersByTime(4999)
    expect(mocks.mockElement.textContent).toBe('Hello')

    vi.advanceTimersByTime(1)
    expect(mocks.mockElement.textContent).toBe('')
  })

  it('applies visually hidden styles', () => {
    const region = createLiveRegion()
    region.announce('Hello')

    expect(mocks.mockElement.style.position).toBe('absolute')
    expect(mocks.mockElement.style.width).toBe('1px')
    expect(mocks.mockElement.style.height).toBe('1px')
    expect(mocks.mockElement.style.overflow).toBe('hidden')
  })
})
