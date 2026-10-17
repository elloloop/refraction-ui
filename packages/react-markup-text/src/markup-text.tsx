import * as React from 'react'
import {
  parseMarkupText,
  groupMarkupTextRuns,
  findMissingMarkupTextTokens,
  normalizeMarkupTextMentions,
  createMarkupText,
  markupTextVariants,
  markupTextStrongClass,
  markupTextCodeClass,
  markupTextLinkClass,
  markupTextMentionVariants,
  markupTextSrOnlyClass,
  MARKUP_TEXT_LINK_REL,
  type MarkupTextMode,
  type MarkupTextMention,
  type MarkupTextSegment,
  type MarkupTextLinkSegment,
  type MarkupTextMentionSegment,
  type MarkupTextAlign,
} from '@refraction-ui/markup-text'
import { cn, devError, devWarn } from '@refraction-ui/shared'

/** Where web links open. `mailto:` links never get a target. */
export type MarkupTextLinkTarget = '_blank' | '_self'

/** Root elements MarkupText can render as. */
export type MarkupTextElement = 'span' | 'p' | 'div'

/** Map of `{token}` names to the nodes that replace them. */
export type MarkupTextInlineMap = Readonly<Record<string, React.ReactNode>>

export interface MarkupTextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** Source text (Flutter `text`). */
  text: string
  /**
   * `'markup'` (default): `**bold**`, `{token}`, `` `code` ``.
   * `'message'`: `**bold**`, `` `code` ``, auto-linked URLs and `mentions`.
   */
  mode?: MarkupTextMode
  /** Nodes for `{token}` placeholders in markup mode (Flutter `inline`). */
  inline?: MarkupTextInlineMap
  /** Mention ranges (UTF-16 offsets into `text`). Message mode only. */
  mentions?: readonly MarkupTextMention[]
  /** Makes mention chips buttons and is called with the clicked mention. */
  onMentionClick?: (mention: MarkupTextMention) => void
  /** Extra classes for bold runs (Flutter `strongStyle`). */
  strongClassName?: string
  /** Horizontal alignment (Flutter `textAlign`). Makes a `span` root block-level. */
  textAlign?: MarkupTextAlign
  /** Where web links open. Defaults to `'_blank'`. */
  linkTarget?: MarkupTextLinkTarget
  /** Screen-reader hint appended to links that open a new tab. */
  newTabLabel?: string
  /** Root element. Defaults to `'span'` so it nests anywhere. */
  as?: MarkupTextElement
}

const DEFAULT_NEW_TAB_LABEL = '(opens in a new tab)'
const NEW_TAB_TARGET: MarkupTextLinkTarget = '_blank'
const MISSING_TOKEN_CODE = 'markup-text/missing-inline-node'
const INVALID_MENTION_CODE = 'markup-text/invalid-mention-range'

function hasInlineNode(inline: MarkupTextInlineMap | undefined, name: string): boolean {
  if (!inline || !Object.prototype.hasOwnProperty.call(inline, name)) return false
  return inline[name] !== undefined
}

/**
 * Report authoring mistakes during development. A missing token renders
 * nothing in every environment (so dev and prod markup match and hydration is
 * stable); the dev error is what makes the mistake impossible to miss.
 */
function reportProblems(
  text: string,
  segments: MarkupTextSegment[],
  inline: MarkupTextInlineMap | undefined,
  mode: MarkupTextMode,
  mentions: readonly MarkupTextMention[] | undefined,
): void {
  for (const name of findMissingMarkupTextTokens(segments, (n) => hasInlineNode(inline, n))) {
    devError(
      `${MISSING_TOKEN_CODE}:${name}`,
      `MarkupText: "{${name}}" has no node in \`inline\`; it renders nothing. Add \`inline={{ ${name}: … }}\`.`,
      { token: name },
    )
  }
  if (mode !== 'message' || !mentions?.length) return
  const accepted = normalizeMarkupTextMentions(text, mentions).length
  if (accepted !== mentions.length) {
    devWarn(
      INVALID_MENTION_CODE,
      `MarkupText: ${mentions.length - accepted} mention range(s) were out of bounds, empty, split a character, or overlapped another and were ignored.`,
    )
  }
}

interface SegmentRenderOptions {
  inline: MarkupTextInlineMap | undefined
  onMentionClick: ((mention: MarkupTextMention) => void) | undefined
  linkTarget: MarkupTextLinkTarget
  newTabLabel: string
}

function renderLink(segment: MarkupTextLinkSegment, key: number, options: SegmentRenderOptions) {
  const opensNewTab = segment.kind === 'web' && options.linkTarget === NEW_TAB_TARGET
  return (
    <a
      key={key}
      href={segment.href}
      rel={MARKUP_TEXT_LINK_REL}
      target={segment.kind === 'web' ? options.linkTarget : undefined}
      className={markupTextLinkClass}
      data-slot="markup-text-link"
    >
      {segment.text}
      {opensNewTab && <span className={markupTextSrOnlyClass}>{` ${options.newTabLabel}`}</span>}
    </a>
  )
}

function renderMention(segment: MarkupTextMentionSegment, key: number, options: SegmentRenderOptions) {
  const { mention } = segment
  const shared = {
    'data-slot': 'markup-text-mention',
    'data-mention-id': mention.id,
    'data-mention-type': mention.type,
  }
  const handler = options.onMentionClick
  if (!handler) {
    return (
      <span key={key} className={markupTextMentionVariants({ interactive: 'false' })} {...shared}>
        {segment.text}
      </span>
    )
  }
  return (
    <button
      key={key}
      type="button"
      className={markupTextMentionVariants({ interactive: 'true' })}
      onClick={() => handler(mention)}
      {...shared}
    >
      {segment.text}
    </button>
  )
}

function renderSegment(segment: MarkupTextSegment, key: number, options: SegmentRenderOptions) {
  switch (segment.type) {
    case 'text':
      return <React.Fragment key={key}>{segment.text}</React.Fragment>
    case 'token':
      // A missing node renders nothing — a placeholder is never shown raw.
      return (
        <React.Fragment key={key}>
          {hasInlineNode(options.inline, segment.name) ? options.inline?.[segment.name] : null}
        </React.Fragment>
      )
    case 'code':
      return (
        <code key={key} className={markupTextCodeClass}>
          {segment.text}
        </code>
      )
    case 'link':
      return renderLink(segment, key, options)
    case 'mention':
      return renderMention(segment, key, options)
  }
}

/**
 * MarkupText — renders `**bold**` runs and `{token}` placeholders (markup
 * mode), or mention chips, safe auto-links and inline code (message mode), as
 * React nodes. Parsing comes from the pure `@refraction-ui/markup-text` core;
 * nothing is ever injected as HTML.
 */
export const MarkupText = React.forwardRef<HTMLElement, MarkupTextProps>(function MarkupText(
  {
    text,
    mode = 'markup',
    inline,
    mentions,
    onMentionClick,
    strongClassName,
    textAlign,
    linkTarget = NEW_TAB_TARGET,
    newTabLabel = DEFAULT_NEW_TAB_LABEL,
    as = 'span',
    className,
    ...props
  },
  ref,
) {
  const segments = React.useMemo(() => parseMarkupText(text, { mode, mentions }), [text, mode, mentions])
  reportProblems(text, segments, inline, mode, mentions)

  const options: SegmentRenderOptions = { inline, onMentionClick, linkTarget, newTabLabel }
  const api = createMarkupText({ mode })
  let key = 0

  const children = groupMarkupTextRuns(segments).map((run, runIndex) => {
    const nodes = run.segments.map((segment) => renderSegment(segment, key++, options))
    if (!run.strong) return <React.Fragment key={`run-${runIndex}`}>{nodes}</React.Fragment>
    return (
      <strong key={`run-${runIndex}`} className={cn(markupTextStrongClass, strongClassName)}>
        {nodes}
      </strong>
    )
  })

  return React.createElement(
    as,
    {
      ref,
      className: cn(markupTextVariants({ textAlign: textAlign ?? 'inherit' }), className),
      ...api.dataAttributes,
      ...props,
    },
    children,
  )
})
