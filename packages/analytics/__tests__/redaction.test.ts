import { describe, it, expect } from 'vitest'
import { createRedactor, PII_DENY_LIST, REDACTED } from '../src/redaction.js'

describe('createRedactor — built-in PII deny-list', () => {
  it('redacts email/phone/name and common variants', () => {
    const r = createRedactor()
    const out = r.redact({
      email: 'a@b.com',
      userEmail: 'c@d.com',
      email_address: 'e@f.com',
      phone: '+1555',
      phoneNumber: '+1556',
      firstName: 'Ada',
      lastName: 'Lovelace',
      fullName: 'Ada Lovelace',
      plan: 'pro',
    })!
    expect(out.email).toBe(REDACTED)
    expect(out.userEmail).toBe(REDACTED)
    expect(out.email_address).toBe(REDACTED)
    expect(out.phone).toBe(REDACTED)
    expect(out.phoneNumber).toBe(REDACTED)
    expect(out.firstName).toBe(REDACTED)
    expect(out.lastName).toBe(REDACTED)
    expect(out.fullName).toBe(REDACTED)
    // Non-PII passes through untouched.
    expect(out.plan).toBe('pro')
  })

  it('exposes the deny-list and redaction token', () => {
    expect(PII_DENY_LIST).toContain('email')
    expect(PII_DENY_LIST).toContain('phone')
    expect(REDACTED).toBe('[REDACTED]')
  })

  it('recurses into nested objects and arrays', () => {
    const r = createRedactor()
    const out = r.redact({
      profile: { email: 'x@y.com', tier: 'gold' },
      contacts: [{ phone: '111' }, { phone: '222' }],
    })!
    const profile = out.profile as Record<string, unknown>
    expect(profile.email).toBe(REDACTED)
    expect(profile.tier).toBe('gold')
    const contacts = out.contacts as Array<Record<string, unknown>>
    expect(contacts[0].phone).toBe(REDACTED)
    expect(contacts[1].phone).toBe(REDACTED)
  })

  it('does not mutate the input object', () => {
    const r = createRedactor()
    const input = { email: 'a@b.com' }
    r.redact(input)
    expect(input.email).toBe('a@b.com')
  })

  it('returns undefined for undefined input', () => {
    const r = createRedactor()
    expect(r.redact(undefined)).toBeUndefined()
  })
})

describe('createRedactor — caller redactKeys', () => {
  it('redacts extra keys exactly (normalised, case-insensitive)', () => {
    const r = createRedactor(['internalScore', 'secret_token'])
    const out = r.redact({
      internalScore: 99,
      InternalScore: 98,
      secretToken: 'abc',
      keep: 'ok',
    })!
    expect(out.internalScore).toBe(REDACTED)
    expect(out.InternalScore).toBe(REDACTED)
    expect(out.secretToken).toBe(REDACTED)
    expect(out.keep).toBe('ok')
  })

  it('shouldRedact reflects both deny-list and extra keys', () => {
    const r = createRedactor(['campaignBudget'])
    expect(r.shouldRedact('email')).toBe(true)
    expect(r.shouldRedact('campaignBudget')).toBe(true)
    expect(r.shouldRedact('eventName')).toBe(false)
  })
})
