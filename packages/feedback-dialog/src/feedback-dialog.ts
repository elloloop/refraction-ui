import type { AccessibilityProps } from '@elloloop/shared'
import { createDialog, type DialogAPI } from '@elloloop/dialog'
import { generateId } from '@elloloop/shared'

export type FeedbackType = 'text' | 'video' | 'general'

export interface FeedbackDialogProps {
  /** Whether the dialog is open (controlled) */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Callback when feedback is submitted */
  onSubmit?: (data: FeedbackData) => void | Promise<void>
  /** Feedback type */
  type?: FeedbackType
}

export interface FeedbackData {
  comment: string
  email?: string
  type: FeedbackType
  selectedText?: string
}

export interface FeedbackFormState {
  comment: string
  email: string
  honeypot: string
}

export interface FeedbackDialogState {
  open: boolean
  isSubmitting: boolean
  isSubmitted: boolean
}

export interface FeedbackDialogAPI {
  /** Current state */
  state: FeedbackDialogState
  /** Dialog props from the underlying createDialog */
  dialogProps: DialogAPI
  /** Form field values */
  formState: FeedbackFormState
  /** Set a form field value */
  setField(field: keyof FeedbackFormState, value: string): void
  /** Submit the feedback form */
  submit(): Promise<void>
  /** Reset form to initial state */
  reset(): void
  /** ARIA props for the feedback dialog */
  ariaProps: Partial<AccessibilityProps> & Record<string, unknown>
}

export function createFeedbackDialog(props: FeedbackDialogProps = {}): FeedbackDialogAPI {
  const {
    open: controlledOpen,
    onOpenChange,
    onSubmit,
    type = 'general',
  } = props

  const dialog = createDialog({
    open: controlledOpen,
    onOpenChange,
    modal: true,
  })

  let isSubmitting = false
  let isSubmitted = false

  const formState: FeedbackFormState = {
    comment: '',
    email: '',
    honeypot: '',
  }

  const feedbackId = generateId('rfr-feedback')

  function setField(field: keyof FeedbackFormState, value: string): void {
    formState[field] = value
  }

  async function submit(): Promise<void> {
    // Honeypot check — bots fill this hidden field
    if (formState.honeypot) {
      return
    }

    if (!formState.comment.trim()) {
      return
    }

    isSubmitting = true

    const data: FeedbackData = {
      comment: formState.comment,
      type,
      ...(formState.email ? { email: formState.email } : {}),
    }

    try {
      await onSubmit?.(data)
      isSubmitting = false
      isSubmitted = true
    } catch {
      isSubmitting = false
    }
  }

  function reset(): void {
    formState.comment = ''
    formState.email = ''
    formState.honeypot = ''
    isSubmitting = false
    isSubmitted = false
  }

  const ariaProps: Partial<AccessibilityProps> & Record<string, unknown> = {
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': `${feedbackId}-title`,
    'aria-describedby': `${feedbackId}-desc`,
    id: feedbackId,
  }

  return {
    get state() {
      return {
        get open() {
          return dialog.state.open
        },
        get isSubmitting() {
          return isSubmitting
        },
        get isSubmitted() {
          return isSubmitted
        },
      }
    },
    dialogProps: dialog,
    formState,
    setField,
    submit,
    reset,
    ariaProps,
  }
}
