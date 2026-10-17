import { ReactionTrayExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Chat & AI/ReactionTray' }
export default meta

export const Basic = { render: () => <ReactionTrayExamples section="basic" /> }
export const Expanded = {
  render: () => <ReactionTrayExamples section="expanded" />,
}
export const Sizes = { render: () => <ReactionTrayExamples section="sizes" /> }
export const CustomGlyph = {
  render: () => <ReactionTrayExamples section="custom-glyph" />,
}
