import { InfiniteCanvasExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Components/InfiniteCanvas' }
export default meta

export const Basic = { render: () => <InfiniteCanvasExamples section="basic" /> }
export const ZoomControls = {
  render: () => <InfiniteCanvasExamples section="controls" />,
}
export const FitToContent = {
  render: () => <InfiniteCanvasExamples section="fit" />,
}
