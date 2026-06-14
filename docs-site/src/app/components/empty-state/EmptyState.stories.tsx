import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState, ConfirmationCard } from '@refraction-ui/react-empty-state'

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  args: {
    title: 'No messages yet',
    description: "When you receive messages, they'll show up here.",
    tone: 'neutral',
    bordered: false,
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'success', 'warning', 'danger']
    },
    bordered: { control: 'boolean' },
    title: { control: 'text' },
    description: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

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

const buttonClasses =
  'inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground'
const outlineButtonClasses =
  'inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground'

export const Default: Story = {
  render: (args) => (
    <EmptyState
      {...args}
      icon={<InboxIcon />}
      actions={
        <button className={buttonClasses} onClick={() => alert('Compose')}>
          Compose
        </button>
      }
    />
  ),
}

export const Confirmation: StoryObj<typeof ConfirmationCard> = {
  render: (args) => (
    <ConfirmationCard
      {...args}
      icon={<MailIcon />}
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
  ),
  args: {
    tone: 'success',
  }
}
