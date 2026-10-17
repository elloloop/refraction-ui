import { ShortcutsDialogExamples } from './examples'

// Curated from the docs-site examples (real props/content).
const meta = { title: 'Overlays/ShortcutsDialog' }
export default meta

export const RegisteredShortcuts = { render: () => <ShortcutsDialogExamples section="basic" /> }
export const SaneDefaults = { render: () => <ShortcutsDialogExamples section="defaults" /> }
export const PassedShortcuts = { render: () => <ShortcutsDialogExamples section="static" /> }
export const Localised = { render: () => <ShortcutsDialogExamples section="localised" /> }
