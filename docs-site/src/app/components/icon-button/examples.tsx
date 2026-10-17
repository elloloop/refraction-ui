'use client'

import * as React from 'react'
import { IconButton } from '@refraction-ui/react-icon-button'

export type IconButtonExampleSection =
  | 'basic'
  | 'variants'
  | 'sizes'
  | 'toggle'
  | 'tap-target'
  | 'disabled'

interface IconButtonExamplesProps {
  section: IconButtonExampleSection
}

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
    >
      {children}
    </svg>
  )
}

const SettingsIcon = () => (
  <Glyph>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </Glyph>
)
const SearchIcon = () => (
  <Glyph>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </Glyph>
)
const MoreIcon = () => (
  <Glyph>
    <circle cx="5" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
  </Glyph>
)
const CloseIcon = () => (
  <Glyph>
    <path d="M18 6 6 18M6 6l12 12" />
  </Glyph>
)
const TrashIcon = () => (
  <Glyph>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </Glyph>
)
const SendIcon = () => (
  <Glyph>
    <path d="m22 2-7 20-4-9-9-4z" />
    <path d="M22 2 11 13" />
  </Glyph>
)
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
const CameraIcon = () => (
  <Glyph>
    <path d="m22 8-6 4 6 4V8z" />
    <rect x="2" y="6" width="14" height="12" rx="2" />
  </Glyph>
)
const CameraOffIcon = () => (
  <Glyph>
    <path d="m2 2 20 20M16 16v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h2m5 0h5a1 1 0 0 1 1 1v3.3l1 1L22 8v8" />
  </Glyph>
)

const frame = 'rounded-xl border border-border bg-card p-8'

// Outlines each button's invisible hit-area extender so the 44 px target is visible.
const revealHitArea =
  '[&_[data-icon-button-hit-area]]:outline-dashed [&_[data-icon-button-hit-area]]:outline-1 [&_[data-icon-button-hit-area]]:outline-primary'

function BasicExample() {
  return (
    <div className={frame}>
      <div className="flex items-center gap-1" role="toolbar" aria-label="Message actions">
        <IconButton icon={<SearchIcon />} label="Search messages" />
        <IconButton icon={<SettingsIcon />} label="Conversation settings" />
        <IconButton icon={<MoreIcon />} label="More actions" />
      </div>
    </div>
  )
}

function VariantsExample() {
  return (
    <div className={`${frame} flex flex-wrap items-center gap-3`}>
      <IconButton icon={<CloseIcon />} label="Close (ghost)" />
      <IconButton icon={<SettingsIcon />} label="Settings (outline)" variant="outline" />
      <IconButton icon={<SearchIcon />} label="Search (secondary)" variant="secondary" />
      <IconButton icon={<SendIcon />} label="Send (default)" variant="default" />
      <IconButton icon={<SendIcon />} label="Send (soft)" variant="soft" />
      <IconButton icon={<TrashIcon />} label="Delete (destructive)" variant="destructive" />
    </div>
  )
}

function SizesExample() {
  return (
    <div className={`${frame} flex flex-wrap items-center gap-4`}>
      <IconButton icon={<SettingsIcon />} label="Settings, extra small" size="xs" />
      <IconButton icon={<SettingsIcon />} label="Settings, small" size="sm" />
      <IconButton icon={<SettingsIcon />} label="Settings, default" />
      <IconButton icon={<SettingsIcon />} label="Settings, 20 px glyph" iconSize={20} />
    </div>
  )
}

function ToggleExample() {
  const [muted, setMuted] = React.useState(false)
  const [cameraOff, setCameraOff] = React.useState(true)
  return (
    <div className={`${frame} space-y-4`}>
      <div className="flex items-center gap-3">
        {/* Ghost toggle: built-in pressed fill plus an icon swap. */}
        <IconButton
          icon={muted ? <MicOffIcon /> : <MicIcon />}
          label="Mute microphone"
          pressed={muted}
          onClick={() => setMuted((m) => !m)}
        />
        {/* Other variants: express "on" by swapping variant and icon. */}
        <IconButton
          icon={cameraOff ? <CameraOffIcon /> : <CameraIcon />}
          label="Camera off"
          variant={cameraOff ? 'destructive' : 'secondary'}
          pressed={cameraOff}
          onClick={() => setCameraOff((c) => !c)}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Microphone {muted ? 'muted' : 'live'} · camera {cameraOff ? 'off' : 'on'}
      </p>
    </div>
  )
}

function TapTargetExample() {
  return (
    <div className={`${frame} space-y-4`}>
      <div className={`flex items-center gap-3 ${revealHitArea}`}>
        <IconButton icon={<CloseIcon />} label="Close, 28 px visual" size="xs" />
        <IconButton icon={<CloseIcon />} label="Close, 32 px visual" size="sm" />
        <IconButton icon={<CloseIcon />} label="Close, 36 px visual" />
        <IconButton icon={<CloseIcon />} label="Close, 48 px target" minTapTarget={48} />
      </div>
      <p className="text-sm text-muted-foreground">
        Dashed outlines show the invisible hit area. It grows to{' '}
        <code className="text-xs bg-muted px-1 rounded">minTapTarget</code> without moving the
        buttons or their neighbours.
      </p>
    </div>
  )
}

function DisabledExample() {
  return (
    <div className={`${frame} flex items-center gap-3`}>
      <IconButton icon={<SendIcon />} label="Send" variant="default" disabled />
      <IconButton icon={<TrashIcon />} label="Delete" disabled />
    </div>
  )
}

export function IconButtonExamples({ section }: IconButtonExamplesProps) {
  switch (section) {
    case 'basic':
      return <BasicExample />
    case 'variants':
      return <VariantsExample />
    case 'sizes':
      return <SizesExample />
    case 'toggle':
      return <ToggleExample />
    case 'tap-target':
      return <TapTargetExample />
    case 'disabled':
      return <DisabledExample />
    default:
      return null
  }
}
