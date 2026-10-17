import { SandboxFrameExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Utilities/SandboxFrame' }
export default meta

export const Basic = { render: () => <SandboxFrameExamples section="basic" /> }
export const AutoHeight = {
  render: () => <SandboxFrameExamples section="auto-height" />,
}
export const HostileHtml = {
  render: () => <SandboxFrameExamples section="hostile" />,
}
export const States = {
  render: () => <SandboxFrameExamples section="states" />,
}
