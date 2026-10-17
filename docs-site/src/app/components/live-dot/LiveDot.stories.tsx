import { LiveDotExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Feedback/LiveDot' }
export default meta

export const Basic = { render: () => <LiveDotExamples section="basic" /> }
export const Colors = { render: () => <LiveDotExamples section="colors" /> }
export const Sizes = { render: () => <LiveDotExamples section="sizes" /> }
export const InContext = {
  render: () => <LiveDotExamples section="in-context" />,
}
export const Standalone = {
  render: () => <LiveDotExamples section="standalone" />,
}
