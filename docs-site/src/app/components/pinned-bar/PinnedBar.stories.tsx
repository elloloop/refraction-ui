import { PinnedBarExamples } from './examples'

// Curated from the docs-site examples (real component, real props).
const meta = { title: 'Chat & AI/PinnedBar' }
export default meta

export const Basic = { render: () => <PinnedBarExamples section="basic" /> }
export const Unpin = { render: () => <PinnedBarExamples section="unpin" /> }
export const Collapsed = { render: () => <PinnedBarExamples section="collapsed" /> }
export const SinglePin = { render: () => <PinnedBarExamples section="single" /> }
export const CustomLabels = { render: () => <PinnedBarExamples section="labels" /> }
