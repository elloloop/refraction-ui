import * as React from 'react'
import {
  createMarkdownRenderer,
  proseVariants,
  type MarkdownRendererProps as CoreProps,
  type ComponentDef,
} from '@elloloop/markdown-renderer'
import { cn } from '@elloloop/shared'

export type { ComponentDef }

export interface MarkdownRendererProps {
  content: string
  components?: Record<string, ComponentDef>
  linkResolver?: (url: string) => string
  className?: string
  size?: 'sm' | 'default' | 'lg'
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
 * Uses the headless @elloloop/markdown-renderer core for parsing.
 * XSS sanitization is applied before rendering via dangerouslySetInnerHTML.
 */
export const MarkdownRenderer = React.forwardRef<HTMLDivElement, MarkdownRendererProps>(
  ({ content, components, linkResolver, className, size }, ref) => {
    const coreProps: CoreProps = { content, components, linkResolver }
    const api = createMarkdownRenderer(coreProps)
    const classes = cn(proseVariants({ size }), className)
    const sanitizedHtml = sanitizeHtml(api.html)

    return (
      <div
        ref={ref}
        className={classes}
        {...api.ariaProps}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    )
  },
)

MarkdownRenderer.displayName = 'MarkdownRenderer'
