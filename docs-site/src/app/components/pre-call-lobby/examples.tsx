'use client'

import * as React from 'react'
import { PreCallLobby } from '@refraction-ui/react-pre-call-lobby'

interface PreCallLobbyExamplesProps {
  section: 'basic' | 'camera-off' | 'with-devices'
}

export function PreCallLobbyExamples({ section }: PreCallLobbyExamplesProps) {
  if (section === 'basic') {
    return <BasicExample />
  }

  if (section === 'camera-off') {
    return <CameraOffExample />
  }

  if (section === 'with-devices') {
    return <WithDevicesExample />
  }

  return null
}

function BasicExample() {
  const [cameraOn, setCameraOn] = React.useState(true)
  const [micOn, setMicOn] = React.useState(true)
  const [micLevel] = React.useState(0.4)

  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <PreCallLobby
        cameraOn={cameraOn}
        micOn={micOn}
        micLevel={micLevel}
        onToggleCamera={() => setCameraOn((v) => !v)}
        onToggleMic={() => setMicOn((v) => !v)}
        joinLabel="Join now"
        onJoin={() => alert('Joining!')}
        aria-label="Meeting preflight"
      />
    </div>
  )
}

function CameraOffExample() {
  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <PreCallLobby
        cameraOn={false}
        micOn={true}
        micLevel={0}
        aria-label="Camera off example"
      />
    </div>
  )
}

function WithDevicesExample() {
  const cameras = [
    { id: 'cam1', label: 'Built-in FaceTime Camera' },
    { id: 'cam2', label: 'External Webcam (USB)' },
  ]
  const microphones = [
    { id: 'mic1', label: 'Built-in Microphone' },
    { id: 'mic2', label: 'AirPods Pro' },
  ]
  const speakers = [
    { id: 'spk1', label: 'Built-in Speakers' },
    { id: 'spk2', label: 'AirPods Pro' },
  ]

  const [cameraOn, setCameraOn] = React.useState(true)
  const [micOn, setMicOn] = React.useState(true)
  const [micLevel] = React.useState(0.6)
  const [selectedCamera, setSelectedCamera] = React.useState('cam1')
  const [selectedMicrophone, setSelectedMicrophone] = React.useState('mic1')
  const [selectedSpeaker, setSelectedSpeaker] = React.useState('spk1')

  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <PreCallLobby
        cameraOn={cameraOn}
        micOn={micOn}
        micLevel={micLevel}
        cameras={cameras}
        microphones={microphones}
        speakers={speakers}
        selectedCamera={selectedCamera}
        selectedMicrophone={selectedMicrophone}
        selectedSpeaker={selectedSpeaker}
        onToggleCamera={() => setCameraOn((v) => !v)}
        onToggleMic={() => setMicOn((v) => !v)}
        onDeviceChange={(kind, id) => {
          if (kind === 'camera') setSelectedCamera(id)
          else if (kind === 'microphone') setSelectedMicrophone(id)
          else setSelectedSpeaker(id)
        }}
        joinLabel="Join"
        aria-label="Device selection example"
      />
    </div>
  )
}
