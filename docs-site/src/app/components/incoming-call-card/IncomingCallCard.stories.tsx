import { IncomingCallCardExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Calls & Media/IncomingCallCard' }
export default meta

export const Overlay = { render: () => <IncomingCallCardExamples section="overlay" /> }
export const Video = { render: () => <IncomingCallCardExamples section="video" /> }
export const Window = { render: () => <IncomingCallCardExamples section="window" /> }
export const ControlledCountdown = {
  render: () => <IncomingCallCardExamples section="countdown" />,
}
