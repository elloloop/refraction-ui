import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  devWarn,
  devError,
  setDevFeedbackSink,
  resetDevFeedback,
  type DevFeedbackRecord,
} from '../src/dev-feedback.js'

describe('dev-feedback', () => {
  const originalEnv = process.env.NODE_ENV
  let warnSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    resetDevFeedback()
    setDevFeedbackSink(null)
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    warnSpy.mockRestore()
    errorSpy.mockRestore()
    setDevFeedbackSink(null)
    resetDevFeedback()
  })

  describe('prod env guard', () => {
    it('does NOT warn when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production'
      devWarn('a/b', 'should be stripped at runtime')
      devError('c/d', 'also stripped')
      expect(warnSpy).not.toHaveBeenCalled()
      expect(errorSpy).not.toHaveBeenCalled()
    })

    it('does NOT forward to an injected sink in production', () => {
      process.env.NODE_ENV = 'production'
      const records: DevFeedbackRecord[] = []
      setDevFeedbackSink({ log: (r) => records.push(r) })
      devWarn('a/b', 'msg')
      devError('a/c', 'msg')
      expect(records).toHaveLength(0)
    })

    it('builds the guard from a string compare (statically strippable)', () => {
      // The source must use a NODE_ENV string comparison so bundlers can
      // dead-code-eliminate. Assert the literal is present in the source.
      // (Behavioral proof of strip is the two tests above.)
      const src = readSource()
      expect(src).toContain("process.env?.NODE_ENV !== 'production'")
    })
  })

  describe('warn-once dedupe', () => {
    it('warns only once per code', () => {
      process.env.NODE_ENV = 'development'
      devWarn('react/footgun', 'first')
      devWarn('react/footgun', 'second (suppressed)')
      devWarn('react/footgun', 'third (suppressed)')
      expect(warnSpy).toHaveBeenCalledTimes(1)
    })

    it('errors only once per code', () => {
      process.env.NODE_ENV = 'development'
      devError('react/invariant', 'first')
      devError('react/invariant', 'second (suppressed)')
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })

    it('different codes are reported independently', () => {
      process.env.NODE_ENV = 'development'
      devWarn('code/one', 'm1')
      devWarn('code/two', 'm2')
      expect(warnSpy).toHaveBeenCalledTimes(2)
    })

    it('a warn and an error sharing a code are not collapsed', () => {
      process.env.NODE_ENV = 'development'
      devWarn('shared/code', 'as warn')
      devError('shared/code', 'as error')
      expect(warnSpy).toHaveBeenCalledTimes(1)
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })

    it('resetDevFeedback clears dedupe state', () => {
      process.env.NODE_ENV = 'development'
      devWarn('x/y', 'one')
      resetDevFeedback()
      devWarn('x/y', 'two')
      expect(warnSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('zero hard dependency on @refraction-ui/logger', () => {
    it('dev-feedback source never imports the logger', () => {
      const src = readSource()
      // No ESM/CJS/dynamic import of the telemetry lib (prose mentions in
      // JSDoc are fine — the contract is mirrored structurally, not imported).
      expect(src).not.toMatch(
        /(?:import|require|from)\s*\(?\s*['"]@refraction-ui\/logger['"]/,
      )
      expect(src).not.toMatch(/from\s+['"]@refraction-ui\/logger['"]/)
    })

    it('shared package.json declares no dependencies at all', async () => {
      const pkg = await import('../package.json', {
        with: { type: 'json' },
      })
      const deps = (pkg.default ?? pkg) as {
        dependencies?: Record<string, string>
      }
      expect(deps.dependencies ?? {}).toEqual({})
    })
  })

  describe('optional sink forwarding (inversion, opt-in only)', () => {
    it('does NOT forward when no sink is injected', () => {
      process.env.NODE_ENV = 'development'
      // No setDevFeedbackSink call — nothing should phone home.
      expect(() => devWarn('no/sink', 'msg')).not.toThrow()
      expect(warnSpy).toHaveBeenCalledTimes(1)
    })

    it('forwards a structured record ONLY when a sink is injected', () => {
      process.env.NODE_ENV = 'development'
      const records: DevFeedbackRecord[] = []
      setDevFeedbackSink({ log: (r) => records.push(r) })

      devWarn('w/code', 'warn message', { extra: 1 })
      devError('e/code', 'error message')

      expect(records).toHaveLength(2)
      expect(records[0]).toMatchObject({
        level: 'warn',
        message: 'w/code: warn message',
        context: { code: 'w/code', extra: 1 },
      })
      expect(typeof records[0].timestamp).toBe('number')
      expect(records[1]).toMatchObject({
        level: 'error',
        message: 'e/code: error message',
        context: { code: 'e/code' },
      })
    })

    it('a throwing sink never breaks the caller', () => {
      process.env.NODE_ENV = 'development'
      setDevFeedbackSink({
        log() {
          throw new Error('sink boom')
        },
      })
      expect(() => devWarn('safe/code', 'msg')).not.toThrow()
    })

    it('unwiring with null stops forwarding', () => {
      process.env.NODE_ENV = 'development'
      const records: DevFeedbackRecord[] = []
      setDevFeedbackSink({ log: (r) => records.push(r) })
      devWarn('a/1', 'm')
      setDevFeedbackSink(null)
      devWarn('a/2', 'm')
      expect(records).toHaveLength(1)
    })
  })
})

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

function readSource(): string {
  const path = fileURLToPath(
    new URL('../src/dev-feedback.ts', import.meta.url),
  )
  return readFileSync(path, 'utf8')
}
