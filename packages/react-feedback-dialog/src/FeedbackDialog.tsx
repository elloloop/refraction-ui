import * as React from 'react'
import {
  createFeedbackDialog,
  feedbackDialogVariants,
  type FeedbackDialogProps as CoreProps,
  type FeedbackData,
  type FeedbackType,
} from '@elloloop/feedback-dialog'
import { cn } from '@elloloop/shared'

// ---------------------------------------------------------------------------
// FeedbackDialog
// ---------------------------------------------------------------------------

export interface FeedbackDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit?: (data: FeedbackData) => void | Promise<void>
  type?: FeedbackType
  className?: string
  children?: React.ReactNode
}

export function FeedbackDialog({
  open: controlledOpen,
  onOpenChange,
  onSubmit,
  type = 'general',
  className,
}: FeedbackDialogProps) {
  const [open, setOpen] = React.useState(controlledOpen ?? false)
  const [comment, setComment] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [honeypot, setHoneypot] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : open

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setOpen(next)
      }
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )

  const apiRef = React.useRef<ReturnType<typeof createFeedbackDialog> | null>(null)
  if (apiRef.current === null) {
    apiRef.current = createFeedbackDialog({ open: isOpen, onOpenChange: handleOpenChange, onSubmit, type })
  }

  const handleSubmit = React.useCallback(async () => {
    if (honeypot) return
    if (!comment.trim()) return

    setIsSubmitting(true)
    const data: FeedbackData = {
      comment,
      type,
      ...(email ? { email } : {}),
    }

    try {
      await onSubmit?.(data)
      setIsSubmitting(false)
      setIsSubmitted(true)
    } catch {
      setIsSubmitting(false)
    }
  }, [comment, email, honeypot, type, onSubmit])

  const handleReset = React.useCallback(() => {
    setComment('')
    setEmail('')
    setHoneypot('')
    setIsSubmitting(false)
    setIsSubmitted(false)
  }, [])

  if (!isOpen) return null

  const api = apiRef.current

  if (isSubmitted) {
    return React.createElement(
      'div',
      {
        className: cn(feedbackDialogVariants({ type }), className),
        ...api.ariaProps,
        'data-state': 'submitted',
      },
      React.createElement('p', { 'data-testid': 'success-message' }, 'Thank you for your feedback!'),
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: () => {
            handleReset()
            handleOpenChange(false)
          },
        },
        'Close',
      ),
    )
  }

  return React.createElement(
    'div',
    {
      className: cn(feedbackDialogVariants({ type }), className),
      ...api.ariaProps,
      'data-state': 'open',
    },
    React.createElement('h2', { id: `${api.ariaProps.id}-title` }, 'Send Feedback'),
    React.createElement('textarea', {
      'aria-label': 'Feedback comment',
      value: comment,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value),
      placeholder: 'Your feedback...',
      disabled: isSubmitting,
    }),
    React.createElement('input', {
      type: 'email',
      'aria-label': 'Email',
      value: email,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
      placeholder: 'Email (optional)',
      disabled: isSubmitting,
    }),
    // Honeypot field — hidden from real users
    React.createElement('input', {
      type: 'text',
      'aria-hidden': true,
      tabIndex: -1,
      style: { position: 'absolute', left: '-9999px' },
      value: honeypot,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setHoneypot(e.target.value),
      autoComplete: 'off',
      name: 'website',
    }),
    React.createElement(
      'button',
      {
        type: 'button',
        onClick: handleSubmit,
        disabled: isSubmitting || !comment.trim(),
      },
      isSubmitting ? 'Submitting...' : 'Submit',
    ),
  )
}

FeedbackDialog.displayName = 'FeedbackDialog'

// ---------------------------------------------------------------------------
// FeedbackButton
// ---------------------------------------------------------------------------

export interface FeedbackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
}

export const FeedbackButton = React.forwardRef<HTMLButtonElement, FeedbackButtonProps>(
  ({ children, ...props }, ref) => {
    return React.createElement(
      'button',
      {
        ref,
        type: 'button',
        'aria-label': 'Send feedback',
        ...props,
      },
      children ?? 'Feedback',
    )
  },
)

FeedbackButton.displayName = 'FeedbackButton'
