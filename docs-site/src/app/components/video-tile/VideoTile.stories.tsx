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
export const Media = { render: () => <VideoTileExamples section="media" /> }
export const HandRaisedAndScreenShare = {
  render: () => <VideoTileExamples section="hand-screen" />,
}
export const TileOptions = {
  render: () => <VideoTileExamples section="tile-options" />,
}
// A real <video> playing a canvas-drawn MediaStream — the element a call app
// attaches a participant track to. Storybook only: its pixels change per frame.
export const LiveStream = {
  render: () => <VideoTileExamples section="live-stream" />,
}
