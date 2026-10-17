import { KeycapExamples } from './examples'

// Curated from the docs-site examples (real props/content).
const meta = { title: 'Data Display/Keycap' }
export default meta

export const Basic = { render: () => <KeycapExamples section="basic" /> }
export const Sizes = { render: () => <KeycapExamples section="sizes" /> }
export const States = { render: () => <KeycapExamples section="states" /> }
export const Legends = { render: () => <KeycapExamples section="legends" /> }
export const Platforms = { render: () => <KeycapExamples section="platforms" /> }
export const InlineInASentence = { render: () => <KeycapExamples section="inline" /> }
export const HoldToTalk = { render: () => <KeycapExamples section="hold" /> }
