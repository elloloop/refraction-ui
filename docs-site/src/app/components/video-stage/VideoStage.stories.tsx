import { VideoStageExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Calls & Media/VideoStage' }
export default meta

export const Grid = {
  render: () => <VideoStageExamples section="grid" />,
}

export const Paging = {
  render: () => <VideoStageExamples section="paging" />,
}

export const Presentation = {
  render: () => <VideoStageExamples section="presentation" />,
}

export const PinAndMaximize = {
  render: () => <VideoStageExamples section="pin-and-zoom" />,
}

export const ActiveSpeaker = {
  render: () => <VideoStageExamples section="active-speaker" />,
}

export const NarrowAndPortrait = {
  render: () => <VideoStageExamples section="compact" />,
}

// Real <video> elements playing canvas-drawn MediaStreams, attached through
// renderMedia. Storybook only: its pixels change per frame.
export const LiveStream = {
  render: () => <VideoStageExamples section="live-stream" />,
}
