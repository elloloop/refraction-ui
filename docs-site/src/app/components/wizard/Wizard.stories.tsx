import { WizardExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Navigation/Wizard' }
export default meta

export const Basic = { render: () => <WizardExamples section="basic" /> }
export const Horizontal = {
  render: () => <WizardExamples section="horizontal" />,
}
export const Controlled = {
  render: () => <WizardExamples section="controlled" />,
}
