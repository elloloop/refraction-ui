'use client'

import * as React from 'react'
import {
  StepCard,
  InstructionList,
  STEP_STATUSES,
  type StepStatus,
} from '@refraction-ui/react-step-card'

type Section = 'basic' | 'statuses' | 'live' | 'guide' | 'instruction-list'

interface StepCardExamplesProps {
  section: Section
}

/** How long the simulated permission check takes in the live demo. */
const SIMULATED_CHECK_MS = 2000

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <path d="M12 19v3" />
    </svg>
  )
}

function ScreenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  )
}

function AccessibilityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3Z" />
      <path d="M5 8l7 1.5L19 8" />
      <path d="M12 9.5V14l-3 7" />
      <path d="M12 14l3 7" />
    </svg>
  )
}

function Keycap({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-xs text-foreground">
      {children}
    </kbd>
  )
}

const MIC_INSTRUCTIONS = [
  'Open **System Settings** with {settingsKey}.',
  'Go to **Privacy & Security → Microphone**.',
  'Turn on **Refraction**.',
]

const MIC_INLINE = { settingsKey: <Keycap>⌘ ,</Keycap> }

const MIC_TROUBLESHOOTING = [
  'If **Refraction** is not in the list, quit and reopen the app, then try again.',
  'Managed Macs may block microphone access — ask your IT team.',
]

const LIVE_HINT = 'Waiting for you to turn on Refraction in System Settings…'

export function StepCardExamples({ section }: StepCardExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-background p-6">
        <StepCard
          icon={<MicIcon />}
          title="Microphone"
          reason="So people in your calls can hear you."
          status="needed"
          actionLabel="Open System Settings"
          onAction={() => undefined}
          instructionsTitle="How to allow it"
          instructions={MIC_INSTRUCTIONS}
          inline={MIC_INLINE}
          troubleshooting={MIC_TROUBLESHOOTING}
        />
      </div>
    )
  }

  if (section === 'statuses') return <StatusesExample />
  if (section === 'live') return <LiveExample />
  if (section === 'guide') return <GuideExample />

  if (section === 'instruction-list') {
    return (
      <div className="rounded-xl border border-border bg-background p-6">
        <InstructionList
          title="Turn on screen recording"
          steps={[
            'Open **System Settings**.',
            'Choose **Privacy & Security → Screen Recording**.',
            'Turn on **Refraction**, then press {restart}.',
          ]}
          inline={{ restart: <Keycap>Quit & Reopen</Keycap> }}
        />
      </div>
    )
  }

  return null
}

function StatusesExample() {
  return (
    <div className="grid gap-4 rounded-xl border border-border bg-background p-6 md:grid-cols-2">
      {STEP_STATUSES.map((status) => (
        <StepCard
          key={status}
          icon={<MicIcon />}
          title="Microphone"
          reason={`status="${status}"`}
          status={status}
          expanded={false}
        />
      ))}
    </div>
  )
}

/** Simulates the app checking the permission after the user acts. */
function LiveExample() {
  const [status, setStatus] = React.useState<StepStatus>('needed')

  React.useEffect(() => {
    if (status !== 'checking') return
    const timer = window.setTimeout(() => setStatus('granted'), SIMULATED_CHECK_MS)
    return () => window.clearTimeout(timer)
  }, [status])

  const done = status === 'granted'
  return (
    <div className="space-y-3 rounded-xl border border-border bg-background p-6">
      <StepCard
        icon={<ScreenIcon />}
        title="Screen recording"
        reason="So you can share your screen in calls."
        status={status}
        actionLabel={done ? undefined : 'Open System Settings'}
        onAction={() => setStatus('checking')}
        instructions={[
          'Open **Privacy & Security → Screen Recording**.',
          'Turn on **Refraction**.',
        ]}
        liveHint={LIVE_HINT}
        troubleshooting="Screen recording only takes effect after Refraction restarts."
      />
      <button
        type="button"
        className="text-sm text-muted-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={() => setStatus('needed')}
      >
        Reset demo
      </button>
    </div>
  )
}

interface GuideStep {
  id: string
  icon: React.ReactNode
  title: string
  reason: string
}

const GUIDE_STEPS: GuideStep[] = [
  { id: 'mic', icon: <MicIcon />, title: 'Microphone', reason: 'So people can hear you.' },
  { id: 'screen', icon: <ScreenIcon />, title: 'Screen recording', reason: 'So you can share your screen.' },
  {
    id: 'a11y',
    icon: <AccessibilityIcon />,
    title: 'Accessibility',
    reason: 'So push-to-talk works in any app.',
  },
]

/** A setup guide: only the current step is expanded; earlier steps are granted. */
function GuideExample() {
  const [current, setCurrent] = React.useState(0)

  const statusFor = (index: number): StepStatus => {
    if (index < current) return 'granted'
    if (index === current) return 'needed'
    return 'notDetermined'
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-background p-6">
      {GUIDE_STEPS.map((step, index) => (
        <StepCard
          key={step.id}
          icon={step.icon}
          title={step.title}
          reason={step.reason}
          status={statusFor(index)}
          expanded={index === current}
          actionLabel="Mark as allowed"
          onAction={() => setCurrent((c) => c + 1)}
          instructions={[
            `Open **Privacy & Security → ${step.title}**.`,
            'Turn on **Refraction**.',
          ]}
        />
      ))}
      {current >= GUIDE_STEPS.length && (
        <button
          type="button"
          className="text-sm text-muted-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={() => setCurrent(0)}
        >
          Start over
        </button>
      )}
    </div>
  )
}
