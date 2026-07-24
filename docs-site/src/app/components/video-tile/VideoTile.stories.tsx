import { VideoTileExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Calls & Media/VideoTile' }
export default meta

export const Basic = { render: () => <VideoTileExamples section="basic" /> }
export const SpeakingAndMuted = {
  render: () => <VideoTileExamples section="speaking-muted" />,
}
export const Pinned = {
  render: () => <VideoTileExamples section="pinned" />,
}
