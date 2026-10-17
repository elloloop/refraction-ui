import { VideoGridExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Calls & Media/VideoGrid' }
export default meta

export const SmallGroup = {
  render: () => <VideoGridExamples section="small-group" />,
}

export const LargeGrid = {
  render: () => <VideoGridExamples section="large-grid" />,
}

export const SpeakerView = {
  render: () => <VideoGridExamples section="speaker-view" />,
}

export const Media = {
  render: () => <VideoGridExamples section="media" />,
}

export const CustomTiles = {
  render: () => <VideoGridExamples section="tile-options" />,
}

// Real <video> elements playing canvas-drawn MediaStreams, attached through
// renderMedia. Storybook only: its pixels change per frame.
export const LiveStream = {
  render: () => <VideoGridExamples section="live-stream" />,
}
