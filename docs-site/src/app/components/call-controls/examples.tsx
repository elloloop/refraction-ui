'use client'

import * as React from 'react'
import { CallControls, CallControlButton } from '@refraction-ui/react-call-controls'

interface CallControlsExamplesProps {
  section: 'basic' | 'toggled' | 'leave'
}

export function CallControlsExamples({ section }: CallControlsExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8 flex justify-center">
        <CallControls>
          <CallControlButton label="Mute mic" />
          <CallControlButton label="Stop camera" />
          <CallControlButton label="Share screen" />
          <CallControlButton label="React" />
          <CallControlButton label="More options" />
          <CallControlButton label="Leave" tone="destructive" />
        </CallControls>
      </div>
    )
  }

  if (section === 'toggled') {
    return <ToggledExample />
  }

  if (section === 'leave') {
    return (
      <div className="rounded-xl border border-border bg-card p-8 flex justify-center">
        <CallControls>
          <CallControlButton label="Mic on" tone="active" pressed={true} />
          <CallControlButton label="Camera on" tone="active" pressed={true} />
          <CallControlButton label="Share screen" />
          <CallControlButton label="Leave call" tone="destructive" />
        </CallControls>
      </div>
    )
  }

  return null
}

function ToggledExample() {
  const [micOn, setMicOn] = React.useState(true)
  const [cameraOn, setCameraOn] = React.useState(true)
  const [sharing, setSharing] = React.useState(false)

  return (
    <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-center gap-4">
      <CallControls>
        <CallControlButton
          label={micOn ? 'Mute mic' : 'Unmute mic'}
          tone={micOn ? 'active' : 'destructive'}
          pressed={micOn}
          onClick={() => setMicOn((v) => !v)}
        />
        <CallControlButton
          label={cameraOn ? 'Stop camera' : 'Start camera'}
          tone={cameraOn ? 'active' : 'destructive'}
          pressed={cameraOn}
          onClick={() => setCameraOn((v) => !v)}
        />
        <CallControlButton
          label={sharing ? 'Stop sharing' : 'Share screen'}
          tone={sharing ? 'active' : 'default'}
          pressed={sharing}
          onClick={() => setSharing((v) => !v)}
        />
        <CallControlButton label="Leave" tone="destructive" />
      </CallControls>
      <p className="text-sm text-muted-foreground">
        Mic: {micOn ? 'on' : 'muted'} · Camera: {cameraOn ? 'on' : 'off'} · Screen: {sharing ? 'sharing' : 'not sharing'}
      </p>
    </div>
  )
}
