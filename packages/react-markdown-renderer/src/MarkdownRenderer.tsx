import * as React from 'react'
import { enhanceUnicodeEmojiDisplay } from '@refraction-ui/emoji-picker'
import {
  createMarkdownRenderer,
  proseVariants,
  type MarkdownRendererProps as CoreProps,
  type ComponentDef,
} from '@refraction-ui/markdown-renderer'
import { cn } from '@refraction-ui/shared'

export type { ComponentDef }

export interface MarkdownRendererProps {
  content: string
  components?: Record<string, ComponentDef>
  linkResolver?: (url: string) => string
  className?: string
  size?: 'sm' | 'default' | 'lg'
  emojiArtwork?: boolean
  twemojiBaseUrl?: string
}

/**
 * Sanitize HTML to prevent XSS attacks.
 * Strips script tags, on* event attributes, and javascript: URLs.
 */
function sanitizeHtml(html: string): string {
  let sanitized = html

  // Remove <script> tags and their contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove standalone <script> opening/closing tags
  sanitized = sanitized.replace(/<\/?script[^>]*>/gi, '')

  // Remove on* event handler attributes
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')

  // Remove javascript: URLs from href and src attributes
  sanitized = sanitized.replace(/(href|src)\s*=\s*["']?\s*javascript\s*:[^"'>]*/gi, '$1=""')

  return sanitized
}

/**
 * MarkdownRenderer component — renders markdown content as sanitized HTML.
 *
 * Uses the headless @refraction-ui/markdown-renderer core for parsing.
 * XSS sanitization is applied before rendering via dangerouslySetInnerHTML.
 */
export const MarkdownRenderer = React.forwardRef<HTMLDivElement, MarkdownRendererProps>(
  function MarkdownRenderer({ content, components, linkResolver, className, size, emojiArtwork = true, twemojiBaseUrl }, ref) {
    const coreProps: CoreProps = { content, components, linkResolver }
    const api = createMarkdownRenderer(coreProps)
    const classes = cn(proseVariants({ size }), className)
    const sanitizedHtml = sanitizeHtml(api.html)

    const ownRef = React.useRef<HTMLDivElement>(null)
    const setRef = React.useCallback((node: HTMLDivElement | null) => {
      ownRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }, [ref])
    React.useEffect(() => {
      const node = ownRef.current
      if (!node) return
      // Reset from sanitized canonical HTML when content/options change.
      node.innerHTML = sanitizedHtml
      if (emojiArtwork) enhanceUnicodeEmojiDisplay(node, twemojiBaseUrl)
    }, [sanitizedHtml, emojiArtwork, twemojiBaseUrl])

    return (
      <div
        ref={setRef}
        className={classes}
        {...api.ariaProps}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    )
  },
)
