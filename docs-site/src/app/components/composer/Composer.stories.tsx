import { ComposerExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Chat & AI/Composer' }
export default meta

export const Basic = { render: () => <ComposerExamples section="basic" /> }
export const Mentions = { render: () => <ComposerExamples section="mentions" /> }
export const SlashAndEmoji = {
  render: () => <ComposerExamples section="slashAndEmoji" />,
}
export const Attachments = {
  render: () => <ComposerExamples section="attachments" />,
}
export const BusyStop = { render: () => <ComposerExamples section="busyStop" /> }
export const EditMode = { render: () => <ComposerExamples section="editMode" /> }
export const States = { render: () => <ComposerExamples section="states" /> }
