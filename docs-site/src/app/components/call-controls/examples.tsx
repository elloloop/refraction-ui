'use client'

import * as React from 'react'
import {
  CallControls,
  CallControlButton,
  callControlsMenuTriggerClass,
  type CallControlsProps,
} from '@refraction-ui/react-call-controls'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@refraction-ui/react-dropdown-menu'

interface CallControlsExamplesProps {
  section: 'basic' | 'toggled' | 'leave' | 'dock' | 'narrow' | 'devices'
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

  if (section === 'dock') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <DockExample />
      </div>
    )
  }

  if (section === 'narrow') {
    return (
      <div className="rounded-xl border border-border bg-card p-4 sm:p-8">
        <div
          data-testid="call-controls-narrow-frame"
          className="mx-auto w-full max-w-[22.5rem] rounded-lg border border-dashed border-border px-2 py-4"
        >
          <DockExample />
        </div>
      </div>
    )
  }

  if (section === 'devices') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <DevicesExample />
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

/** One on/off control whose state lives in the example, as a call app's would. */
function useToggle(initial: boolean): [boolean, () => void] {
  const [value, setValue] = React.useState(initial)
  return [value, () => setValue((v) => !v)]
}

function DockExample() {
  const [mic, toggleMic] = useToggle(true)
  const [camera, toggleCamera] = useToggle(false)
  const [sharing, toggleSharing] = useToggle(true)
  const [hand, toggleHand] = useToggle(false)
  const [captions, toggleCaptions] = useToggle(true)
  const [recording, toggleRecording] = useToggle(false)
  const [chat, toggleChat] = useToggle(false)
  const [people, togglePeople] = useToggle(false)
  const [reactionsOpen, setReactionsOpen] = React.useState(false)
  const [left, setLeft] = React.useState(false)

  const status = [
    `Mic ${mic ? 'on' : 'off'}`,
    `camera ${camera ? 'on' : 'off'}`,
    sharing ? 'sharing' : 'not sharing',
    hand ? 'hand raised' : null,
    captions ? 'captions on' : null,
    recording ? 'recording' : null,
    chat ? 'chat open' : null,
    people ? 'participants open' : null,
    reactionsOpen ? 'reaction picker open' : null,
    left ? 'left the call' : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const props: CallControlsProps = {
    mic: { active: mic, onToggle: toggleMic },
    camera: { active: camera, onToggle: toggleCamera },
    screenShare: { active: sharing, onToggle: toggleSharing },
    hand: { active: hand, onToggle: toggleHand },
    reactions: { onOpen: () => setReactionsOpen((v) => !v), expanded: reactionsOpen },
    captions: { active: captions, onToggle: toggleCaptions },
    record: { active: recording, onToggle: toggleRecording },
    chat: { active: chat, onToggle: toggleChat, count: 3 },
    people: { active: people, onToggle: togglePeople, count: 6 },
    onLeave: () => setLeft(true),
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <CallControls {...props} />
      <p className="text-center text-sm text-muted-foreground">{status}</p>
    </div>
  )
}

const MICROPHONES = ['Built-in microphone', 'USB headset', 'Studio microphone']
const CAMERAS = ['FaceTime HD camera', 'Desk camera']

function ChevronUpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  )
}

/** A device picker for a capsule slot, built from DropdownMenu. */
function DeviceMenu({
  label,
  devices,
  selected,
  onSelect,
}: {
  label: string
  devices: string[]
  selected: string
  onSelect: (device: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={`${label} options`} title={`${label} options`} className={callControlsMenuTriggerClass}>
          <ChevronUpIcon />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        {devices.map((device) => (
          <DropdownMenuItem
            key={device}
            role="menuitemradio"
            aria-checked={device === selected}
            onSelect={() => onSelect(device)}
          >
            <span aria-hidden="true" className="inline-block w-4">
              {device === selected ? '✓' : ''}
            </span>
            {device}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DevicesExample() {
  const [mic, toggleMic] = useToggle(true)
  const [camera, toggleCamera] = useToggle(true)
  const [microphone, setMicrophone] = React.useState(MICROPHONES[0]!)
  const [cameraDevice, setCameraDevice] = React.useState(CAMERAS[0]!)

  return (
    <div className="flex flex-col items-center gap-4">
      <CallControls
        mic={{
          active: mic,
          onToggle: toggleMic,
          menu: <DeviceMenu label="Microphone" devices={MICROPHONES} selected={microphone} onSelect={setMicrophone} />,
        }}
        camera={{
          active: camera,
          onToggle: toggleCamera,
          menu: <DeviceMenu label="Camera" devices={CAMERAS} selected={cameraDevice} onSelect={setCameraDevice} />,
        }}
        onLeave={() => {}}
      />
      <p className="text-center text-sm text-muted-foreground">
        {microphone} · {cameraDevice}
      </p>
    </div>
  )
}
