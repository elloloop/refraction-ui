import { SortableListExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Data Display/SortableList' }
export default meta

export const Basic = { render: () => <SortableListExamples section="basic" /> }
export const CustomRow = {
  render: () => <SortableListExamples section="custom-row" />,
}
export const KeyboardNote = {
  render: () => <SortableListExamples section="keyboard-note" />,
}
