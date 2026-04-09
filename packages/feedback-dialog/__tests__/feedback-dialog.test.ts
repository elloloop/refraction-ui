import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetIdCounter } from '@elloloop/shared'
import { createFeedbackDialog, feedbackDialogVariants } from '../src/index.js'

beforeEach(() => {
  resetIdCounter()
})

describe('createFeedbackDialog', () => {
  it('defaults to closed state', () => {
    const api = createFeedbackDialog()
    expect(api.state.open).toBe(false)
  })

  it('respects controlled open prop', () => {
    const api = createFeedbackDialog({ open: true })
    expect(api.state.open).toBe(true)
  })

  it('defaults isSubmitting and isSubmitted to false', () => {
    const api = createFeedbackDialog()
    expect(api.state.isSubmitting).toBe(false)
    expect(api.state.isSubmitted).toBe(false)
  })

  it('provides dialogProps from createDialog', () => {
    const api = createFeedbackDialog()
    expect(api.dialogProps).toBeDefined()
    expect(api.dialogProps.state).toBeDefined()
    expect(api.dialogProps.open).toBeTypeOf('function')
    expect(api.dialogProps.close).toBeTypeOf('function')
  })
})

describe('form state', () => {
  it('starts with empty form fields', () => {
    const api = createFeedbackDialog()
    expect(api.formState.comment).toBe('')
    expect(api.formState.email).toBe('')
    expect(api.formState.honeypot).toBe('')
  })

  it('updates comment via setField', () => {
    const api = createFeedbackDialog()
    api.setField('comment', 'Great work!')
    expect(api.formState.comment).toBe('Great work!')
  })

  it('updates email via setField', () => {
    const api = createFeedbackDialog()
    api.setField('email', 'user@example.com')
    expect(api.formState.email).toBe('user@example.com')
  })

  it('updates honeypot via setField', () => {
    const api = createFeedbackDialog()
    api.setField('honeypot', 'bot value')
    expect(api.formState.honeypot).toBe('bot value')
  })
})

describe('honeypot detection', () => {
  it('does not call onSubmit when honeypot is filled', async () => {
    const onSubmit = vi.fn()
    const api = createFeedbackDialog({ onSubmit })
    api.setField('comment', 'Some feedback')
    api.setField('honeypot', 'bot detected')
    await api.submit()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('submit flow', () => {
  it('does not submit when comment is empty', async () => {
    const onSubmit = vi.fn()
    const api = createFeedbackDialog({ onSubmit })
    await api.submit()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not submit when comment is whitespace-only', async () => {
    const onSubmit = vi.fn()
    const api = createFeedbackDialog({ onSubmit })
    api.setField('comment', '   ')
    await api.submit()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with feedback data', async () => {
    const onSubmit = vi.fn()
    const api = createFeedbackDialog({ onSubmit, type: 'text' })
    api.setField('comment', 'Looks great!')
    api.setField('email', 'user@test.com')
    await api.submit()
    expect(onSubmit).toHaveBeenCalledWith({
      comment: 'Looks great!',
      type: 'text',
      email: 'user@test.com',
    })
  })

  it('sets isSubmitted to true after successful submit', async () => {
    const onSubmit = vi.fn()
    const api = createFeedbackDialog({ onSubmit })
    api.setField('comment', 'Feedback')
    await api.submit()
    expect(api.state.isSubmitted).toBe(true)
  })

  it('omits email if not provided', async () => {
    const onSubmit = vi.fn()
    const api = createFeedbackDialog({ onSubmit, type: 'general' })
    api.setField('comment', 'Some text')
    await api.submit()
    expect(onSubmit).toHaveBeenCalledWith({
      comment: 'Some text',
      type: 'general',
    })
  })
})

describe('reset', () => {
  it('resets all form state', async () => {
    const onSubmit = vi.fn()
    const api = createFeedbackDialog({ onSubmit })
    api.setField('comment', 'text')
    api.setField('email', 'a@b.com')
    await api.submit()
    expect(api.state.isSubmitted).toBe(true)

    api.reset()
    expect(api.formState.comment).toBe('')
    expect(api.formState.email).toBe('')
    expect(api.formState.honeypot).toBe('')
    expect(api.state.isSubmitting).toBe(false)
    expect(api.state.isSubmitted).toBe(false)
  })
})

describe('ariaProps', () => {
  it('provides dialog role and aria-modal', () => {
    const api = createFeedbackDialog()
    expect(api.ariaProps.role).toBe('dialog')
    expect(api.ariaProps['aria-modal']).toBe(true)
  })

  it('generates unique ids for title and description', () => {
    const api = createFeedbackDialog()
    expect(api.ariaProps['aria-labelledby']).toMatch(/^rfr-feedback-\d+-title$/)
    expect(api.ariaProps['aria-describedby']).toMatch(/^rfr-feedback-\d+-desc$/)
  })
})

describe('feedbackDialogVariants', () => {
  it('exports variant styles', () => {
    const classes = feedbackDialogVariants()
    expect(classes).toContain('fixed')
    expect(classes).toContain('z-50')
    expect(classes).toContain('rounded-lg')
  })

  it('applies type variant', () => {
    const classes = feedbackDialogVariants({ type: 'video' })
    expect(classes).toContain('max-w-lg')
  })
})

// ── Additional tests ──

describe('honeypot detection - additional', () => {
  it('honeypot blocks submit even with valid comment', async () => {
    const onSubmit = vi.fn()
    const api = createFeedbackDialog({ onSubmit })
    api.setField('comment', 'Legitimate feedback')
    api.setField('email', 'user@test.com')
    api.setField('honeypot', 'spam-bot')
    await api.submit()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(api.state.isSubmitted).toBe(false)
  })

  it('honeypot with single character still blocks', async () => {
    const onSubmit = vi.fn()
    const api = createFeedbackDialog({ onSubmit })
    api.setField('comment', 'Good feedback')
    api.setField('honeypot', 'x')
    await api.submit()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('empty comment blocks submit', () => {
  it('empty string comment does not submit', async () => {
    const onSubmit = vi.fn()
    const api = createFeedbackDialog({ onSubmit })
    api.setField('comment', '')
    await api.submit()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('tab and newline only comment does not submit', async () => {
    const onSubmit = vi.fn()
    const api = createFeedbackDialog({ onSubmit })
    api.setField('comment', '\t\n  \n\t')
    await api.submit()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('submit flow - isSubmitting and isSubmitted', () => {
  it('isSubmitted is true after successful submit', async () => {
    const onSubmit = vi.fn()
    const api = createFeedbackDialog({ onSubmit })
    api.setField('comment', 'Feedback text')
    await api.submit()
    expect(api.state.isSubmitted).toBe(true)
    expect(api.state.isSubmitting).toBe(false)
  })

  it('isSubmitting is false after error in onSubmit', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('fail'))
    const api = createFeedbackDialog({ onSubmit })
    api.setField('comment', 'Some feedback')
    await api.submit()
    expect(api.state.isSubmitting).toBe(false)
    expect(api.state.isSubmitted).toBe(false)
  })

  it('submit without onSubmit callback still sets isSubmitted', async () => {
    const api = createFeedbackDialog()
    api.setField('comment', 'Text')
    await api.submit()
    expect(api.state.isSubmitted).toBe(true)
  })
})

describe('reset clears form', () => {
  it('reset clears comment, email, honeypot', () => {
    const api = createFeedbackDialog()
    api.setField('comment', 'text')
    api.setField('email', 'a@b.com')
    api.setField('honeypot', 'bot')
    api.reset()
    expect(api.formState.comment).toBe('')
    expect(api.formState.email).toBe('')
    expect(api.formState.honeypot).toBe('')
  })

  it('reset after submit clears isSubmitted', async () => {
    const onSubmit = vi.fn()
    const api = createFeedbackDialog({ onSubmit })
    api.setField('comment', 'feedback')
    await api.submit()
    expect(api.state.isSubmitted).toBe(true)
    api.reset()
    expect(api.state.isSubmitted).toBe(false)
    expect(api.state.isSubmitting).toBe(false)
  })

  it('reset allows resubmission', async () => {
    const onSubmit = vi.fn()
    const api = createFeedbackDialog({ onSubmit })
    api.setField('comment', 'first')
    await api.submit()
    expect(onSubmit).toHaveBeenCalledTimes(1)

    api.reset()
    api.setField('comment', 'second')
    await api.submit()
    expect(onSubmit).toHaveBeenCalledTimes(2)
  })
})

describe('FeedbackDialog - type prop', () => {
  it('submit includes type in data', async () => {
    const onSubmit = vi.fn()
    const api = createFeedbackDialog({ onSubmit, type: 'video' })
    api.setField('comment', 'Great video')
    await api.submit()
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ type: 'video' }))
  })

  it('defaults to general type', async () => {
    const onSubmit = vi.fn()
    const api = createFeedbackDialog({ onSubmit })
    api.setField('comment', 'General feedback')
    await api.submit()
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ type: 'general' }))
  })
})

describe('FeedbackDialog - dialogProps integration', () => {
  it('dialogProps exposes open function', () => {
    const api = createFeedbackDialog()
    expect(api.dialogProps.open).toBeTypeOf('function')
  })

  it('dialogProps exposes close function', () => {
    const api = createFeedbackDialog()
    expect(api.dialogProps.close).toBeTypeOf('function')
  })

  it('dialogProps exposes toggle function', () => {
    const api = createFeedbackDialog()
    expect(api.dialogProps.toggle).toBeTypeOf('function')
  })

  it('onOpenChange callback is called when dialog opens', () => {
    const onOpenChange = vi.fn()
    const api = createFeedbackDialog({ onOpenChange })
    api.dialogProps.open()
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('onOpenChange callback is called when dialog closes', () => {
    const onOpenChange = vi.fn()
    const api = createFeedbackDialog({ open: true, onOpenChange })
    api.dialogProps.close()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('FeedbackDialog - ariaProps uniqueness', () => {
  it('two instances have different aria ids', () => {
    const api1 = createFeedbackDialog()
    const api2 = createFeedbackDialog()
    expect(api1.ariaProps['aria-labelledby']).not.toBe(api2.ariaProps['aria-labelledby'])
  })

  it('ariaProps includes id field', () => {
    const api = createFeedbackDialog()
    expect(api.ariaProps.id).toMatch(/^rfr-feedback-\d+$/)
  })
})
