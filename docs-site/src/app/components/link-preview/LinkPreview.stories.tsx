import { LinkPreviewExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Chat & AI/LinkPreview' }
export default meta

export const Full = { render: () => <LinkPreviewExamples section="full" /> }
export const Compact = {
  render: () => <LinkPreviewExamples section="compact" />,
}
export const Dismissible = {
  render: () => <LinkPreviewExamples section="dismissible" />,
}
export const Fallbacks = {
  render: () => <LinkPreviewExamples section="fallbacks" />,
}
export const InAMessage = {
  render: () => <LinkPreviewExamples section="message" />,
}
