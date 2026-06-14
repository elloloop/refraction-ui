import { KanbanBoardExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Components/KanbanBoard' }
export default meta

export const Basic = { render: () => <KanbanBoardExamples section="basic" /> }
export const WithAccentsAndNotes = {
  render: () => <KanbanBoardExamples section="accents" />,
}
export const OverflowCap = {
  render: () => <KanbanBoardExamples section="overflow" />,
}
