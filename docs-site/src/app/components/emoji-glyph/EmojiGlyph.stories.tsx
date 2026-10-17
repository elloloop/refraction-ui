import { EmojiGlyphExamples } from './examples'

// Curated from the docs-site examples (real component, real props).
const meta = { title: 'Chat & AI/EmojiGlyph' }
export default meta

export const Basic = { render: () => <EmojiGlyphExamples section="basic" /> }
export const FallbackOrder = {
  render: () => <EmojiGlyphExamples section="fallback" />,
}
export const Still = { render: () => <EmojiGlyphExamples section="still" /> }
export const InReactions = {
  render: () => <EmojiGlyphExamples section="reactions" />,
}
export const SelfHosted = {
  render: () => <EmojiGlyphExamples section="self-hosted" />,
}
