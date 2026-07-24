import { EditorTabsExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Editors & IDE/EditorTabs' }
export default meta

export const Basic = { render: () => <EditorTabsExamples section="basic" /> }
export const DirtyAndClose = {
  render: () => <EditorTabsExamples section="dirty-close" />,
}
export const KeyboardNavigation = {
  render: () => <EditorTabsExamples section="keyboard" />,
}
