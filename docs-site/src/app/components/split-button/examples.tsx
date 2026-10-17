'use client'

import * as React from 'react'
import {
  SplitButton,
  SplitButtonAction,
  SplitButtonTrigger,
  SplitButtonMenu,
  type SplitButtonSize,
  type SplitButtonVariant,
} from '@refraction-ui/react-split-button'
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@refraction-ui/react-dropdown-menu'

export type SplitButtonExampleSection =
  | 'basic'
  | 'variants'
  | 'sizes'
  | 'icon'
  | 'tap-target'
  | 'disabled'

interface SplitButtonExamplesProps {
  section: SplitButtonExampleSection
}

const frame = 'rounded-xl border border-border bg-card p-8'

/* Inline glyphs (24×24, stroke = currentColor) so the demo has no icon-library dependency. */
function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4"
    >
      {children}
    </svg>
  )
}

const MicIcon = () => (
  <Glyph>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4" />
  </Glyph>
)
const MicOffIcon = () => (
  <Glyph>
    <path d="m2 2 20 20M9 9v2a3 3 0 0 0 5.1 2.1M15 9.3V5a3 3 0 0 0-5.9-.6" />
    <path d="M17 16.9A7 7 0 0 1 5 11v-1M19 10v1a7 7 0 0 1-.1 1.2M12 18v4" />
  </Glyph>
)

function LastAction({ value }: { value: string | null }) {
  return (
    <p className="text-sm text-muted-foreground" aria-live="polite">
      {value ? `Last action: ${value}` : 'No action yet'}
    </p>
  )
}

function BasicExample() {
  const [last, setLast] = React.useState<string | null>(null)
  return (
    <div className={`${frame} space-y-4`}>
      <SplitButton aria-label="Save document">
        <SplitButtonAction onClick={() => setLast('Save')}>Save</SplitButtonAction>
        <SplitButtonTrigger label="More save options" />
        <SplitButtonMenu>
          <DropdownMenuItem onSelect={() => setLast('Save as draft')}>Save as draft</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setLast('Save a copy')}>Save a copy</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setLast('Save as template')}>
            Save as template
          </DropdownMenuItem>
        </SplitButtonMenu>
      </SplitButton>
      <LastAction value={last} />
    </div>
  )
}

const variants: SplitButtonVariant[] = [
  'default',
  'secondary',
  'outline',
  'ghost',
  'soft',
  'tertiary',
  'destructive',
]

function VariantsExample() {
  return (
    <div className={`${frame} flex flex-wrap items-center gap-4`}>
      {variants.map((variant) => (
        <SplitButton key={variant} variant={variant} aria-label={`${variant} variant`}>
          <SplitButtonAction className="capitalize">{variant}</SplitButtonAction>
          <SplitButtonTrigger label={`More ${variant} options`} />
          <SplitButtonMenu>
            <DropdownMenuItem>Another action</DropdownMenuItem>
          </SplitButtonMenu>
        </SplitButton>
      ))}
    </div>
  )
}

const sizes: { size: SplitButtonSize; name: string }[] = [
  { size: 'xs', name: 'Extra small' },
  { size: 'sm', name: 'Small' },
  { size: 'default', name: 'Default' },
  { size: 'lg', name: 'Large' },
]

function SizesExample() {
  return (
    <div className={`${frame} flex flex-wrap items-center gap-4`}>
      {sizes.map(({ size, name }) => (
        <SplitButton key={size} size={size} variant="outline" aria-label={`${name} size`}>
          <SplitButtonAction>{name}</SplitButtonAction>
          <SplitButtonTrigger label={`More ${name.toLowerCase()} options`} />
          <SplitButtonMenu>
            <DropdownMenuItem>Another action</DropdownMenuItem>
          </SplitButtonMenu>
        </SplitButton>
      ))}
    </div>
  )
}

const microphones = ['Built-in microphone', 'USB headset', 'Bluetooth earbuds']

function IconExample() {
  const [muted, setMuted] = React.useState(false)
  const [device, setDevice] = React.useState(microphones[0])
  return (
    <div className={`${frame} space-y-4`}>
      <SplitButton variant="secondary" size="icon" aria-label="Microphone">
        <SplitButtonAction
          aria-label="Mute microphone"
          aria-pressed={muted}
          onClick={() => setMuted((m) => !m)}
        >
          {muted ? <MicOffIcon /> : <MicIcon />}
        </SplitButtonAction>
        <SplitButtonTrigger label="Microphone options" />
        <SplitButtonMenu>
          <DropdownMenuLabel>Microphone</DropdownMenuLabel>
          {microphones.map((name) => (
            <DropdownMenuItem key={name} onSelect={() => setDevice(name)}>
              {name}
            </DropdownMenuItem>
          ))}
        </SplitButtonMenu>
      </SplitButton>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {muted ? 'Muted' : 'Live'} · {device}
      </p>
    </div>
  )
}

// Outlines each part's invisible hit-area extender so the 44 px target is visible.
const revealHitArea =
  '[&_[data-split-button-hit-area]]:outline-dashed [&_[data-split-button-hit-area]]:outline-1 [&_[data-split-button-hit-area]]:outline-primary'

function TapTargetExample() {
  return (
    <div className={`${frame} space-y-4`}>
      <div className={`flex flex-wrap items-center gap-8 ${revealHitArea}`}>
        <SplitButton size="xs" variant="outline" aria-label="Reply, 28 px visual">
          <SplitButtonAction>Reply</SplitButtonAction>
          <SplitButtonTrigger label="More reply options" />
          <SplitButtonMenu>
            <DropdownMenuItem>Reply all</DropdownMenuItem>
          </SplitButtonMenu>
        </SplitButton>
        <SplitButton size="sm" variant="outline" aria-label="Reply, 32 px visual">
          <SplitButtonAction>Reply</SplitButtonAction>
          <SplitButtonTrigger label="More reply options" />
          <SplitButtonMenu>
            <DropdownMenuItem>Reply all</DropdownMenuItem>
          </SplitButtonMenu>
        </SplitButton>
        <SplitButton variant="outline" minTapTarget={48} aria-label="Reply, 48 px target">
          <SplitButtonAction>Reply</SplitButtonAction>
          <SplitButtonTrigger label="More reply options" />
          <SplitButtonMenu>
            <DropdownMenuItem>Reply all</DropdownMenuItem>
          </SplitButtonMenu>
        </SplitButton>
      </div>
      <p className="text-sm text-muted-foreground">
        Dashed outlines show the invisible hit areas. Each grows outward from the seam to{' '}
        <code className="text-xs bg-muted px-1 rounded">minTapTarget</code>, so the two never
        overlap and nothing around them moves.
      </p>
    </div>
  )
}

function DisabledExample() {
  return (
    <div className={`${frame} flex flex-wrap items-center gap-4`}>
      <SplitButton disabled aria-label="Publish, disabled">
        <SplitButtonAction>Publish</SplitButtonAction>
        <SplitButtonTrigger label="More publish options" />
        <SplitButtonMenu>
          <DropdownMenuItem>Schedule</DropdownMenuItem>
        </SplitButtonMenu>
      </SplitButton>
      <SplitButton variant="outline" aria-label="Export, options disabled">
        <SplitButtonAction>Export</SplitButtonAction>
        <SplitButtonTrigger label="More export options" disabled />
        <SplitButtonMenu>
          <DropdownMenuItem>Export as CSV</DropdownMenuItem>
        </SplitButtonMenu>
      </SplitButton>
    </div>
  )
}

export function SplitButtonExamples({ section }: SplitButtonExamplesProps) {
  switch (section) {
    case 'basic':
      return <BasicExample />
    case 'variants':
      return <VariantsExample />
    case 'sizes':
      return <SizesExample />
    case 'icon':
      return <IconExample />
    case 'tap-target':
      return <TapTargetExample />
    case 'disabled':
      return <DisabledExample />
    default:
      return null
  }
}
