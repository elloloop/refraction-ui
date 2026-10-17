import { ThreadSummaryExamples } from './examples'

// Curated from the docs-site examples (real props/content).
const meta = { title: 'Chat & AI/ThreadSummary' }
export default meta

export const Basic = { render: () => <ThreadSummaryExamples section="basic" /> }
export const UnderAMessage = {
  render: () => <ThreadSummaryExamples section="in-message" />,
}
export const NarrowRow = { render: () => <ThreadSummaryExamples section="narrow" /> }
export const AvatarSizes = { render: () => <ThreadSummaryExamples section="sizes" /> }
