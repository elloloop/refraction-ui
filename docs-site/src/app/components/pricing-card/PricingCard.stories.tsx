import { PricingCardExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Components/PricingCard' }
export default meta

export const Basic = { render: () => <PricingCardExamples section="basic" /> }
export const Featured = {
  render: () => <PricingCardExamples section="featured" />,
}
export const PayPerUse = {
  render: () => <PricingCardExamples section="payperuse" />,
}
