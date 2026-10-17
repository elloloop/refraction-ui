import { TaskListExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Data Display/TaskList' }
export default meta

export const Grouped = { render: () => <TaskListExamples section="grouped" /> }
export const Selection = {
  render: () => <TaskListExamples section="selection" />,
}
export const RowStates = {
  render: () => <TaskListExamples section="states" />,
}
