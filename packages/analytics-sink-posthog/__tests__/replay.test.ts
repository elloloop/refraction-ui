import { describe, it, expect, vi } from 'vitest'
import { startSessionReplay } from '../src/replay.js'

function fakePostHog() {
  return {
    init: vi.fn(),
    startSessionRecording: vi.fn(),
    stopSessionRecording: vi.fn(),
    sessionRecordingStarted: vi.fn(() => true),
  }
}

describe('session replay — privacy/consent gated', () => {
  it('does NOT start (or even load posthog-js) without consent', async () => {
    const ph = fakePostHog()
    const loadPostHog = vi.fn(async () => ph)
    const handle = await startSessionReplay({
      apiKey: 'k',
      // no hasConsent → treated as NOT consented
      loadPostHog,
    })
    expect(loadPostHog).not.toHaveBeenCalled()
    expect(ph.startSessionRecording).not.toHaveBeenCalled()
    expect(handle.recording).toBe(false)
  })

  it('does not start when hasConsent returns false', async () => {
    const ph = fakePostHog()
    const loadPostHog = vi.fn(async () => ph)
    const handle = await startSessionReplay({
      apiKey: 'k',
      hasConsent: () => false,
      loadPostHog,
    })
    expect(loadPostHog).not.toHaveBeenCalled()
    expect(handle.recording).toBe(false)
  })

  it('starts recording when consent is granted', async () => {
    const ph = fakePostHog()
    const handle = await startSessionReplay({
      apiKey: 'phc_k',
      host: 'https://eu.i.posthog.com',
      hasConsent: () => true,
      loadPostHog: async () => ph,
    })
    expect(ph.init).toHaveBeenCalledWith(
      'phc_k',
      expect.objectContaining({ api_host: 'https://eu.i.posthog.com' }),
    )
    expect(ph.startSessionRecording).toHaveBeenCalledTimes(1)
    expect(handle.recording).toBe(true)
  })

  it('defaults to maximally private masking', async () => {
    const ph = fakePostHog()
    await startSessionReplay({
      apiKey: 'k',
      hasConsent: () => true,
      loadPostHog: async () => ph,
    })
    const opts = ph.init.mock.calls[0][1] as Record<string, any>
    expect(opts.session_recording.maskAllInputs).toBe(true)
    expect(opts.session_recording.maskTextSelector).toBe('*')
  })

  it('lazily loads posthog-js only when consent is granted', async () => {
    const ph = fakePostHog()
    const loadPostHog = vi.fn(async () => ph)
    await startSessionReplay({
      apiKey: 'k',
      hasConsent: () => true,
      loadPostHog,
    })
    expect(loadPostHog).toHaveBeenCalledTimes(1)
  })

  it('enforceConsent() stops recording when consent is revoked', async () => {
    const ph = fakePostHog()
    let consent = true
    const handle = await startSessionReplay({
      apiKey: 'k',
      hasConsent: () => consent,
      loadPostHog: async () => ph,
    })
    expect(handle.recording).toBe(true)
    consent = false
    handle.enforceConsent()
    expect(ph.stopSessionRecording).toHaveBeenCalledTimes(1)
    expect(handle.recording).toBe(false)
  })

  it('stop() is idempotent and tears the recorder down', async () => {
    const ph = fakePostHog()
    const handle = await startSessionReplay({
      apiKey: 'k',
      hasConsent: () => true,
      loadPostHog: async () => ph,
    })
    handle.stop()
    handle.stop()
    expect(ph.stopSessionRecording).toHaveBeenCalledTimes(1)
    expect(handle.recording).toBe(false)
  })

  it('does not start if consent is revoked during the async load', async () => {
    const ph = fakePostHog()
    let consent = true
    const handle = await startSessionReplay({
      apiKey: 'k',
      hasConsent: () => consent,
      loadPostHog: async () => {
        consent = false // revoked mid-load
        return ph
      },
    })
    expect(ph.startSessionRecording).not.toHaveBeenCalled()
    expect(handle.recording).toBe(false)
  })
})
