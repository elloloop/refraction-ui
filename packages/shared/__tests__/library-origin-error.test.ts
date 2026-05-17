import { describe, it, expect } from 'vitest'
import {
  libraryOriginError,
  libraryOriginEnvelope,
  stackFingerprint,
  isLibraryOriginError,
  captureLibraryOriginError,
  type LibraryOriginErrorInput,
  type LibraryOriginIdentity,
} from '../src/library-origin-error.js'
import type { DevFeedbackRecord } from '../src/dev-feedback.js'

const REFRACTION_STACK = [
  'Error: boom',
  '    at Dialog (/abs/path/node_modules/@refraction-ui/react/dist/index.js:120:15)',
  '    at renderWithHooks (/abs/path/node_modules/react-dom/cjs/react-dom.development.js:14985:18)',
  '    at App (/Users/someuser/secret-project/src/App.tsx:42:7)',
].join('\n')

const SAME_ERROR_DIFFERENT_PATHS = [
  'Error: boom',
  '    at Dialog (/totally/different/machine/node_modules/@refraction-ui/react/dist/index.js:120:15)',
  '    at renderWithHooks (/x/react-dom.development.js:99999:1)',
  '    at App (/home/otheruser/another-app/src/Main.tsx:7:3)',
].join('\n')

function input(over: Partial<LibraryOriginErrorInput> = {}): LibraryOriginErrorInput {
  return {
    package: '@refraction-ui/react',
    componentName: 'Dialog',
    version: '0.1.5',
    framework: 'react',
    error: Object.assign(new Error('boom'), { stack: REFRACTION_STACK }),
    ...over,
  }
}

describe('library-origin-error', () => {
  describe('envelope shape (reuses telemetry record contract)', () => {
    it('libraryOriginError returns a LogRecord-shaped record', () => {
      const rec = libraryOriginError(input())
      expect(rec.level).toBe('error')
      expect(typeof rec.message).toBe('string')
      expect(typeof rec.timestamp).toBe('number')
      expect(typeof rec.context).toBe('object')
    })

    it('envelope carries exactly the five identifying fields + origin', () => {
      const env = libraryOriginEnvelope(input())
      expect(env).toEqual({
        origin: 'refraction-ui',
        package: '@refraction-ui/react',
        componentName: 'Dialog',
        version: '0.1.5',
        framework: 'react',
        fingerprint: expect.any(String),
      })
    })

    it('the envelope rides inside context (the telemetry record field)', () => {
      const rec = libraryOriginError(input())
      expect(rec.context.origin).toBe('refraction-ui')
      expect(rec.context.package).toBe('@refraction-ui/react')
      expect(rec.context.fingerprint).toEqual(expect.any(String))
    })
  })

  describe('fingerprint stability + app-data-free', () => {
    it('is stable across runs for the same normalized stack', () => {
      const a = stackFingerprint(input().error)
      const b = stackFingerprint(input().error)
      expect(a).toBe(b)
      expect(a).toMatch(/^[0-9a-f]+$/)
    })

    it('is identical for the same error from different machines/paths', () => {
      const a = stackFingerprint(
        Object.assign(new Error('boom'), { stack: REFRACTION_STACK }),
      )
      const b = stackFingerprint(
        Object.assign(new Error('boom'), {
          stack: SAME_ERROR_DIFFERENT_PATHS,
        }),
      )
      expect(a).toBe(b)
    })

    it('contains NO app paths, usernames, line numbers, or PII', () => {
      const fp = stackFingerprint(
        Object.assign(new Error('boom'), { stack: REFRACTION_STACK }),
      )
      expect(fp).not.toContain('someuser')
      expect(fp).not.toContain('secret-project')
      expect(fp).not.toContain('App.tsx')
      expect(fp).not.toContain('/abs/path')
      expect(fp).not.toMatch(/\d+:\d+/)
    })

    it('the envelope contains no app data beyond the fingerprint hash', () => {
      const env = libraryOriginEnvelope(input())
      const serialized = JSON.stringify(env)
      expect(serialized).not.toContain('someuser')
      expect(serialized).not.toContain('secret-project')
      expect(serialized).not.toContain('App.tsx')
      expect(serialized).not.toContain('/Users/')
    })

    it('different refraction-ui components produce different fingerprints', () => {
      const dialogStack = REFRACTION_STACK
      const tooltipStack = REFRACTION_STACK.replace(
        'Dialog (',
        'Tooltip (',
      ).replace('/dist/index.js', '/dist/tooltip.js')
      const a = stackFingerprint(
        Object.assign(new Error('x'), { stack: dialogStack }),
      )
      const b = stackFingerprint(
        Object.assign(new Error('x'), { stack: tooltipStack }),
      )
      expect(a).not.toBe(b)
    })

    it('app-only stacks (no refraction-ui frames) yield a stable no-frames hash', () => {
      const appOnly = [
        'Error: boom',
        '    at App (/Users/someuser/app/src/App.tsx:1:1)',
        '    at main (/Users/someuser/app/src/main.tsx:2:2)',
      ].join('\n')
      const a = stackFingerprint(
        Object.assign(new Error('boom'), { stack: appOnly }),
      )
      const b = stackFingerprint(
        Object.assign(new Error('boom'), {
          stack: appOnly.replace('someuser', 'otheruser'),
        }),
      )
      // Identical (app frames dropped) and leak-free.
      expect(a).toBe(b)
      const env = libraryOriginEnvelope(input({ error: appOnly }))
      expect(JSON.stringify(env)).not.toContain('someuser')
    })

    it('accepts a raw stack string as well as an Error', () => {
      const a = stackFingerprint(REFRACTION_STACK)
      const b = stackFingerprint(
        Object.assign(new Error('boom'), { stack: REFRACTION_STACK }),
      )
      expect(a).toBe(b)
    })

    it('handles missing/undefined error without throwing', () => {
      expect(() => stackFingerprint(undefined)).not.toThrow()
      expect(stackFingerprint(undefined)).toEqual(expect.any(String))
    })
  })

  describe('isLibraryOriginError (the capture-seam gate)', () => {
    it('is true when the stack has a @refraction-ui/* frame', () => {
      expect(
        isLibraryOriginError(
          Object.assign(new Error('boom'), { stack: REFRACTION_STACK }),
        ),
      ).toBe(true)
      expect(isLibraryOriginError(REFRACTION_STACK)).toBe(true)
    })

    it('is false for an app-only error (no refraction-ui frame)', () => {
      const appOnly = [
        'Error: boom',
        '    at App (/Users/someuser/app/src/App.tsx:1:1)',
        '    at main (/Users/someuser/app/src/main.tsx:2:2)',
      ].join('\n')
      expect(
        isLibraryOriginError(
          Object.assign(new Error('boom'), { stack: appOnly }),
        ),
      ).toBe(false)
    })

    it('is false for a missing/odd error and never throws', () => {
      expect(isLibraryOriginError(undefined)).toBe(false)
      expect(isLibraryOriginError(null)).toBe(false)
      expect(isLibraryOriginError(42)).toBe(false)
      expect(isLibraryOriginError({})).toBe(false)
    })
  })

  describe('captureLibraryOriginError (shared seam primitive)', () => {
    const identity: LibraryOriginIdentity = {
      package: '@refraction-ui/react',
      componentName: 'Dialog',
      version: '0.1.5',
      framework: 'react',
    }

    const appError = Object.assign(new Error('app bug'), {
      stack: [
        'Error: app bug',
        '    at App (/Users/someuser/app/src/App.tsx:1:1)',
      ].join('\n'),
    })
    const libError = Object.assign(new Error('boom'), {
      stack: REFRACTION_STACK,
    })

    it('tags a refraction-origin error and forwards it to the sink', () => {
      const logs: DevFeedbackRecord[] = []
      const sink = { log: (r: DevFeedbackRecord) => logs.push(r) }

      const rec = captureLibraryOriginError(libError, identity, sink)

      expect(rec).not.toBeNull()
      expect(rec!.level).toBe('error')
      expect(rec!.context).toMatchObject({
        origin: 'refraction-ui',
        package: '@refraction-ui/react',
        componentName: 'Dialog',
        version: '0.1.5',
        framework: 'react',
        fingerprint: stackFingerprint(libError),
      })
      expect(logs).toHaveLength(1)
      expect(logs[0]).toBe(rec)
    })

    it('does NOT capture or forward an app-origin error (returns null)', () => {
      const logs: DevFeedbackRecord[] = []
      const sink = { log: (r: DevFeedbackRecord) => logs.push(r) }

      const rec = captureLibraryOriginError(appError, identity, sink)

      expect(rec).toBeNull()
      expect(logs).toHaveLength(0)
    })

    it('is a no-op forward when no sink is wired (still tags the record)', () => {
      const recNull = captureLibraryOriginError(libError, identity, null)
      const recUndef = captureLibraryOriginError(libError, identity, undefined)
      expect(recNull?.context.origin).toBe('refraction-ui')
      expect(recUndef?.context.origin).toBe('refraction-ui')
    })

    it('a throwing sink never breaks the caller', () => {
      const sink = {
        log: () => {
          throw new Error('sink is down')
        },
      }
      expect(() =>
        captureLibraryOriginError(libError, identity, sink),
      ).not.toThrow()
    })

    it('carries no app data beyond the fingerprint hash', () => {
      const rec = captureLibraryOriginError(libError, identity, null)!
      const serialized = JSON.stringify(rec)
      expect(serialized).not.toContain('someuser')
      expect(serialized).not.toContain('secret-project')
      expect(serialized).not.toContain('App.tsx')
      expect(serialized).not.toContain('/Users/')
    })
  })

  describe('zero dependency on @refraction-ui/logger', () => {
    it('source mirrors the contract structurally, never imports the logger', () => {
      const src = readSource()
      // No ESM/CJS/dynamic import of the telemetry lib — the LogRecord
      // contract is reused via the structural mirror, not imported.
      expect(src).not.toMatch(
        /(?:import|require|from)\s*\(?\s*['"]@refraction-ui\/logger['"]/,
      )
      expect(src).not.toMatch(/from\s+['"]@refraction-ui\/logger['"]/)
      expect(src).toContain("from './dev-feedback.js'")
    })
  })
})

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

function readSource(): string {
  const path = fileURLToPath(
    new URL('../src/library-origin-error.ts', import.meta.url),
  )
  return readFileSync(path, 'utf8')
}
