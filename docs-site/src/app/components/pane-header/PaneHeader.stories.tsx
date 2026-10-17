import { PaneHeaderExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Layout/PaneHeader' }
export default meta

export const Basic = { render: () => <PaneHeaderExamples section="basic" /> }
export const TappableTitle = {
  render: () => <PaneHeaderExamples section="tappable" />,
}
export const SplitView = {
  render: () => <PaneHeaderExamples section="split-view" />,
}
export const Truncation = {
  render: () => <PaneHeaderExamples section="truncation" />,
}
