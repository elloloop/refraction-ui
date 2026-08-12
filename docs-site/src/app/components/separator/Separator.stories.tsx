import { SeparatorExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Layout/Separator' }
export default meta

export const Basic = { render: () => <SeparatorExamples section="basic" /> }
export const Labeled = {
  render: () => <SeparatorExamples section="labeled" />,
}
export const Vertical = {
  render: () => <SeparatorExamples section="vertical" />,
}
// Issue #485 — hairline rule using the border-subtle token.
export const Subtle = {
  render: () => <SeparatorExamples section="subtle" />,
}
