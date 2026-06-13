import { describe, it, expect } from 'vitest'
import { formatPrompt, createTerminal } from '../src/index.js'

describe('formatPrompt', () => {
  it('joins the prompt symbol and command with a space', () => {
    expect(formatPrompt('$', 'python solution.py')).toBe('$ python solution.py')
  })

  it('works with alternative prompt symbols', () => {
    expect(formatPrompt('❯', 'node index.js')).toBe('❯ node index.js')
  })

  it('preserves an empty command string', () => {
    expect(formatPrompt('$', '')).toBe('$ ')
  })
})

describe('createTerminal', () => {
  it('returns role="log" for live-region semantics', () => {
    const { ariaProps } = createTerminal()
    expect(ariaProps.role).toBe('log')
  })

  it('returns aria-live="polite"', () => {
    const { ariaProps } = createTerminal()
    expect(ariaProps['aria-live']).toBe('polite')
  })

  it('does not include aria-label when no label is given', () => {
    const { ariaProps } = createTerminal()
    expect(ariaProps['aria-label']).toBeUndefined()
  })

  it('forwards an optional accessible label', () => {
    const { ariaProps } = createTerminal({ label: 'Run output' })
    expect(ariaProps['aria-label']).toBe('Run output')
  })

  it('emits the data-component attribute', () => {
    const { dataAttributes } = createTerminal()
    expect(dataAttributes['data-component']).toBe('terminal')
  })
})
