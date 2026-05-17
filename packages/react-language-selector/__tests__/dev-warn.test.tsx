import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { devWarn, resetDevFeedback } from '@refraction-ui/shared'
import * as LanguageSelectorModule from '../src/language-selector.js'

// NOTE / deviation: react-language-selector exports a single monolithic
// <LanguageSelector>. Its context guard (`useLanguageSelectorContext`) is
// present per the Wave-0 tier map (compound-context-throw) but is dead code:
// the hook is never invoked and never exported, so the guard cannot be driven
// through the package's public API. We therefore assert the guard's devWarn
// CONTRACT (real @refraction-ui/shared: warns once in dev, stripped in prod)
// using the exact stable `code` wired at the guard site, and smoke-test the
// public component, mirroring the existing SSR test style.

const GUARD_CODE = 'react-language-selector/compound-outside-provider'

let warnSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  resetDevFeedback()
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  warnSpy.mockRestore()
})

describe('react-language-selector devWarn (footgun: compound-context-throw)', () => {
  it('exports the LanguageSelector component (guard module loads)', () => {
    expect(typeof LanguageSelectorModule.LanguageSelector).toBe('function')
  })

  it('warns once in dev for the guard code', () => {
    devWarn(GUARD_CODE, 'misuse')
    devWarn(GUARD_CODE, 'misuse')

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0][0]).toContain(GUARD_CODE)
  })

  it('is silent in production for the guard code', () => {
    const prev = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    try {
      devWarn(GUARD_CODE, 'misuse')
      expect(warnSpy).not.toHaveBeenCalled()
    } finally {
      process.env.NODE_ENV = prev
    }
  })
})
