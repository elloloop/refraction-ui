export {
  MarkupText,
  type MarkupTextProps,
  type MarkupTextLinkTarget,
  type MarkupTextElement,
  type MarkupTextInlineMap,
} from './markup-text.js'

// The pure parser and its types ride along so composing components (StepCard,
// InstructionList) and consumers of the meta can reuse the same segments.
export {
  parseMarkupText,
  groupMarkupTextRuns,
  findMissingMarkupTextTokens,
  normalizeMarkupTextMentions,
  sanitizeMarkupTextHref,
  MARKUP_TEXT_LINK_REL,
  type MarkupTextMode,
  type MarkupTextMention,
  type MarkupTextLinkKind,
  type MarkupTextSegment,
  type MarkupTextRun,
  type ParseMarkupTextOptions,
  type MarkupTextAlign,
} from '@refraction-ui/markup-text'
