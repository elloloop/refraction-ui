import { VirtualListExamples } from './examples'

// Curated from the docs-site examples (real component, real props).
const meta = { title: 'Data Display/VirtualList' }
export default meta

export const Basic = { render: () => <VirtualListExamples section="basic" /> }
export const BottomAnchoredChat = {
  render: () => <VirtualListExamples section="chat" />,
}
export const ScrollToIndex = {
  render: () => <VirtualListExamples section="scroll-to" />,
}
