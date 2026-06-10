'use client'

import { EmptyState, ConfirmationCard } from '@refraction-ui/react-empty-state'

interface EmptyStateExamplesProps {
  section: 'basic' | 'tones' | 'confirmation' | 'bordered'
}

function InboxIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  )
}

const buttonClasses =
  'inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground'
const outlineButtonClasses =
  'inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground'

export function EmptyStateExamples({ section }: EmptyStateExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card">
        <EmptyState
          icon={<InboxIcon />}
          title="No messages yet"
          description="When you receive messages, they'll show up here."
          actions={
            <button className={buttonClasses} onClick={() => alert('Compose')}>
              Compose
            </button>
          }
        />
      </div>
    )
  }

  if (section === 'tones') {
    return (
      <div className="rounded-xl border border-border bg-card p-6 grid gap-6 sm:grid-cols-2">
        <EmptyState icon={<InboxIcon />} tone="neutral" title="Neutral" description="Default tone." />
        <EmptyState icon={<CheckIcon />} tone="success" title="Success" description="Everything is done." />
        <EmptyState icon={<AlertIcon />} tone="warning" title="Warning" description="Something needs attention." />
        <EmptyState icon={<AlertIcon />} tone="danger" title="Danger" description="An error occurred." />
      </div>
    )
  }

  if (section === 'confirmation') {
    return (
      <div className="flex justify-center p-6">
        <ConfirmationCard
          icon={<MailIcon />}
          tone="success"
          title="Check your email"
          description={
            <>
              We sent a sign-in link to{' '}
              <strong className="text-foreground">jane@example.com</strong>. It
              expires in 10 minutes.
            </>
          }
          actions={
            <>
              <button className={outlineButtonClasses}>Resend</button>
              <button className={buttonClasses}>Open email app</button>
            </>
          }
          className="max-w-sm"
        />
      </div>
    )
  }

  if (section === 'bordered') {
    return (
      <div className="grid gap-6 p-6 sm:grid-cols-2">
        <EmptyState icon={<InboxIcon />} title="Without border" description="bordered = false" />
        <EmptyState icon={<InboxIcon />} bordered title="With border" description="bordered = true" />
      </div>
    )
  }

  return null
}
