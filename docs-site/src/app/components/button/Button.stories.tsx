import { ButtonExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Components/Button' }
export default meta

export const Variants = { render: () => <ButtonExamples section="variants" /> }
export const Sizes = { render: () => <ButtonExamples section="sizes" /> }
export const States = { render: () => <ButtonExamples section="states" /> }

// Issue #201 — `primary` is an alias of `default`. Side-by-side proves both
// render identically; the alias exists so ecosystem muscle-memory works.
export const PrimaryAlias = {
  render: () => <ButtonExamples section="primary-alias" />,
}
