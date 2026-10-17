import { LevelBarsExamples } from './examples'

// Curated from the docs-site examples (real props/content).
const meta = { title: 'Calls & Media/LevelBars' }
export default meta

export const Basic = { render: () => <LevelBarsExamples section="basic" /> }
export const Tapered = { render: () => <LevelBarsExamples section="taper" /> }
export const Colors = { render: () => <LevelBarsExamples section="colors" /> }
export const Live = { render: () => <LevelBarsExamples section="live" /> }
export const MicrophoneCheck = {
  render: () => <LevelBarsExamples section="microphone" />,
}
