import { CommandDialogExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Overlays/CommandDialog' }
export default meta

export const Basic = { render: () => <CommandDialogExamples section="basic" /> }
export const AsyncResults = {
  render: () => <CommandDialogExamples section="async" />,
}
export const WithoutShortcut = {
  render: () => <CommandDialogExamples section="no-shortcut" />,
}
