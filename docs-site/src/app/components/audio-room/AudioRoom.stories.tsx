import { AudioRoomExamples, SpeakingOrbDemo } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Components/AudioRoom' }
export default meta

export const BasicRoom = {
  render: () => <AudioRoomExamples section="basic" />,
}

export const SpeakingAndMuted = {
  render: () => <AudioRoomExamples section="speaking-muted" />,
}

export const WithRaisedHands = {
  render: () => <AudioRoomExamples section="hand-raised" />,
}

export const OrbStates = {
  render: () => <SpeakingOrbDemo />,
}
