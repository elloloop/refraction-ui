import { SectionHeadExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Marketing/SectionHead' }
export default meta

export const Centered = { render: () => <SectionHeadExamples section="centered" /> }
export const LeftAligned = {
  render: () => <SectionHeadExamples section="left" />,
}
export const WithLede = {
  render: () => <SectionHeadExamples section="with-lede" />,
}
