import { ContextMenuExamples } from './examples'

// Curated from the docs-site examples (real adapter, real props).
const meta = { title: 'Overlays/ContextMenu' }
export default meta

export const Basic = { render: () => <ContextMenuExamples section="basic" /> }
export const CheckboxAndRadio = {
  render: () => <ContextMenuExamples section="checkable" />,
}
export const SharedWithDropdownMenu = {
  render: () => <ContextMenuExamples section="shared" />,
}
