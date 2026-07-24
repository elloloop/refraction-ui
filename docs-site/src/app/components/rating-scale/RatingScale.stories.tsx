import { RatingScaleExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Inputs/RatingScale' }
export default meta

export const Basic = { render: () => <RatingScaleExamples section="basic" /> }
export const Labeled = {
  render: () => <RatingScaleExamples section="labeled" />,
}
export const Controlled = {
  render: () => <RatingScaleExamples section="controlled" />,
}
