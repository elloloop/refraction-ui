import { ChecklistExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Components/Checklist' }
export default meta

export const Basic = { render: () => <ChecklistExamples section="basic" /> }
export const WithProgress = {
  render: () => <ChecklistExamples section="progress" />,
}
export const WithDescriptions = {
  render: () => <ChecklistExamples section="descriptions" />,
}
