import { JumpToLatestExamples } from './examples'

// Curated from the docs-site examples (real component, real props).
const meta = { title: 'Chat & AI/JumpToLatest' }
export default meta

export const PlainScroller = {
  render: () => <JumpToLatestExamples section="plain" />,
}
export const WithVirtualList = {
  render: () => <JumpToLatestExamples section="virtual-list" />,
}
export const FirstUnread = {
  render: () => <JumpToLatestExamples section="first-unread" />,
}
