import { SlotPickerExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Inputs/SlotPicker' }
export default meta

export const Basic = { render: () => <SlotPickerExamples section="basic" /> }
export const WithTimezoneLabel = {
  render: () => <SlotPickerExamples section="timezone" />,
}
export const SomeSlotsDisabled = {
  render: () => <SlotPickerExamples section="disabled-slots" />,
}
