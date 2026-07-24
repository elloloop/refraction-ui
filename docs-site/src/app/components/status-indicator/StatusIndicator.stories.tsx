import { StatusIndicatorExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Components/StatusIndicator' }
export default meta

export const Basic = { render: () => <StatusIndicatorExamples section="basic" /> }
export const ChildrenAsLabel = {
  render: () => <StatusIndicatorExamples section="children" />,
}
export const DotOnly = {
  render: () => <StatusIndicatorExamples section="show-label" />,
}
