import { TestResultsExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Components/TestResults' }
export default meta

export const AllPassing = {
  render: () => <TestResultsExamples section="all-passing" />,
}
export const WithFailures = {
  render: () => <TestResultsExamples section="with-failures" />,
}
export const WithSkipped = {
  render: () => <TestResultsExamples section="with-skipped" />,
}
