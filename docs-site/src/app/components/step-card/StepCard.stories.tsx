import { StepCardExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Feedback/StepCard' }
export default meta

export const Basic = { render: () => <StepCardExamples section="basic" /> }
export const Statuses = { render: () => <StepCardExamples section="statuses" /> }
export const LiveStatus = { render: () => <StepCardExamples section="live" /> }
export const SetupGuide = { render: () => <StepCardExamples section="guide" /> }
export const InstructionListOnly = {
  render: () => <StepCardExamples section="instruction-list" />,
}
