import { StatusIndicatorExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Components/StatusIndicator' }
export default meta

export const Basic = { render: () => <StatusIndicatorExamples section="basic" /> }

// Issue #200 — children-as-label composition matches every other primitive.
export const WithChildren = {
  render: () => <StatusIndicatorExamples section="children" />,
}

// Dot-only mode keeps aria-label for screen readers but hides the visible label.
export const DotOnly = {
  render: () => <StatusIndicatorExamples section="show-label" />,
}
