import { describe, it, expect } from 'vitest'
import {
  createPasswordInput,
  DEFAULT_REVEAL_LABEL,
  DEFAULT_HIDE_LABEL,
} from '../src/password-input.js'
import { passwordToggleVariants } from '../src/password-input.styles.js'

describe('createPasswordInput', () => {
  it('defaults to a masked password input', () => {
    const api = createPasswordInput()
    expect(api.inputType).toBe('password')
    expect(api.toggleLabel).toBe(DEFAULT_REVEAL_LABEL)
    expect(api.togglePressed).toBe(false)
  })

  it('reveals as text with the hide label when revealed', () => {
    const api = createPasswordInput({ revealed: true })
    expect(api.inputType).toBe('text')
    expect(api.toggleLabel).toBe(DEFAULT_HIDE_LABEL)
    expect(api.togglePressed).toBe(true)
  })

  it('uses custom reveal label when masked', () => {
    const api = createPasswordInput({ revealed: false, revealLabel: 'Reveal' })
    expect(api.toggleLabel).toBe('Reveal')
  })

  it('uses custom hide label when revealed', () => {
    const api = createPasswordInput({ revealed: true, hideLabel: 'Conceal' })
    expect(api.toggleLabel).toBe('Conceal')
  })
})

describe('passwordToggleVariants', () => {
  it('positions the toggle absolutely at the trailing edge', () => {
    const classes = passwordToggleVariants()
    expect(classes).toContain('absolute')
    expect(classes).toContain('right-2')
  })

  it('appends a custom className', () => {
    const classes = passwordToggleVariants({ className: 'my-toggle' })
    expect(classes).toContain('my-toggle')
  })
})
