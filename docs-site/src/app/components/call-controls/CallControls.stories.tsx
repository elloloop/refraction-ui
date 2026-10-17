import { CallControlsExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Calls & Media/CallControls' }
export default meta

export const Basic = { render: () => <CallControlsExamples section="basic" /> }
export const Toggled = {
  render: () => <CallControlsExamples section="toggled" />,
}
export const WithLeaveButton = {
  render: () => <CallControlsExamples section="leave" />,
}
export const Dock = { render: () => <CallControlsExamples section="dock" /> }
export const NarrowDock = {
  render: () => <CallControlsExamples section="narrow" />,
}
export const DeviceMenus = {
  render: () => <CallControlsExamples section="devices" />,
}
