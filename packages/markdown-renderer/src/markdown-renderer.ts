import type { AccessibilityProps } from '@refraction-ui/shared'

export interface ComponentDef {
  type: string
  pattern: RegExp
  props: Record<string, string>
}

export interface MarkdownRendererProps {
  content: string
  components?: Record<string, ComponentDef>
  linkResolver?: (url: string) => string
}

export interface MarkdownRendererAPI {
  /** Rendered HTML string */
  html: string
  /** Extracted component slots from custom component definitions */
  components: Array<{ name: string; props: Record<string, string> }>
  /** ARIA attributes for the rendered content container */
  ariaProps: Partial<AccessibilityProps>
}

/**
 * Escape HTML entities to prevent injection in non-code contexts.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Parse inline markdown elements: bold, italic, code, links.
 */
function parseInline(text: string, linkResolver?: (url: string) => string): string {
  let result = escapeHtml(text)

  // Inline code (backticks) — must come before bold/italic to avoid conflicts
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Bold (**text** or __text__)
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  result = result.replace(/__([^_]+)__/g, '<strong>$1</strong>')

  // Italic (*text* or _text_)
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  result = result.replace(/_([^_]+)_/g, '<em>$1</em>')

  // Links [text](url) — reject javascript: URLs for XSS safety
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) => {
    if (/^\s*javascript\s*:/i.test(url)) {
      return text
    }
    const resolvedUrl = linkResolver ? linkResolver(url) : url
    return `<a href="${resolvedUrl}">${text}</a>`
  })

  return result
}

/**
 * Parse a full markdown string into HTML.
 * Handles: headings, bold, italic, links, code (inline & block),
 * lists (unordered & ordered), blockquotes, horizontal rules.
 */
function parseMarkdown(content: string, linkResolver?: (url: string) => string): string {
  const lines = content.split('\n')
  const outputLines: string[] = []
  let inCodeBlock = false
  let codeBlockContent: string[] = []
  let codeBlockLang = ''
  let inList: 'ul' | 'ol' | null = null
  let inBlockquote = false

  function closeList() {
    if (inList) {
      outputLines.push(inList === 'ul' ? '</ul>' : '</ol>')
      inList = null
    }
  }

  function closeBlockquote() {
    if (inBlockquote) {
      outputLines.push('</blockquote>')
      inBlockquote = false
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code blocks (fenced with ```)
    if (line.trimStart().startsWith('```')) {
      if (inCodeBlock) {
        // Closing code block
        outputLines.push(`<pre><code${codeBlockLang ? ` class="language-${escapeHtml(codeBlockLang)}"` : ''}>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`)
        codeBlockContent = []
        codeBlockLang = ''
        inCodeBlock = false
      } else {
        // Opening code block
        closeList()
        closeBlockquote()
        inCodeBlock = true
        codeBlockLang = line.trimStart().slice(3).trim()
      }
      continue
    }

    if (inCodeBlock) {
      codeBlockContent.push(line)
      continue
    }

    // Horizontal rule (--- or ___ or ***)
    if (/^(\s*[-*_]\s*){3,}$/.test(line)) {
      closeList()
      closeBlockquote()
      outputLines.push('<hr />')
      continue
    }

    // Headings (# through ######)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      closeList()
      closeBlockquote()
      const level = headingMatch[1].length
      const text = parseInline(headingMatch[2], linkResolver)
      outputLines.push(`<h${level}>${text}</h${level}>`)
      continue
    }

    // Blockquotes (> text)
    const blockquoteMatch = line.match(/^>\s?(.*)$/)
    if (blockquoteMatch) {
      closeList()
      if (!inBlockquote) {
        inBlockquote = true
        outputLines.push('<blockquote>')
      }
      const text = blockquoteMatch[1].trim()
      if (text) {
        outputLines.push(`<p>${parseInline(text, linkResolver)}</p>`)
      }
      continue
    } else if (inBlockquote) {
      closeBlockquote()
    }

    // Unordered list items (- or * at start)
    const ulMatch = line.match(/^[\s]*[-*+]\s+(.+)$/)
    if (ulMatch) {
      closeBlockquote()
      if (inList !== 'ul') {
        closeList()
        inList = 'ul'
        outputLines.push('<ul>')
      }
      outputLines.push(`<li>${parseInline(ulMatch[1], linkResolver)}</li>`)
      continue
    }

    // Ordered list items (1. 2. etc.)
    const olMatch = line.match(/^[\s]*\d+\.\s+(.+)$/)
    if (olMatch) {
      closeBlockquote()
      if (inList !== 'ol') {
        closeList()
        inList = 'ol'
        outputLines.push('<ol>')
      }
      outputLines.push(`<li>${parseInline(olMatch[1], linkResolver)}</li>`)
      continue
    }

    // If we were in a list and hit a non-list line, close the list
    if (inList) {
      closeList()
    }

    // Empty line
    if (line.trim() === '') {
      continue
    }

    // Regular paragraph
    outputLines.push(`<p>${parseInline(line, linkResolver)}</p>`)
  }

  // Close any open blocks
  if (inCodeBlock) {
    outputLines.push(`<pre><code${codeBlockLang ? ` class="language-${escapeHtml(codeBlockLang)}"` : ''}>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`)
  }
  closeList()
  closeBlockquote()

  return outputLines.join('\n')
}

/**
 * Extract custom component slots from content based on component definitions.
 */
function extractComponents(
  content: string,
  components?: Record<string, ComponentDef>,
): Array<{ name: string; props: Record<string, string> }> {
  if (!components) return []

  const extracted: Array<{ name: string; props: Record<string, string> }> = []

  for (const [name, def] of Object.entries(components)) {
    const matches = content.matchAll(def.pattern)
    for (const _match of matches) {
      extracted.push({
        name,
        props: { ...def.props },
      })
    }
  }

  return extracted
}

/**
 * Create a headless markdown renderer.
 *
 * Uses the headless pattern — returns an API object with rendered HTML,
 * extracted component slots, and ARIA props for the container.
 */
export function createMarkdownRenderer(props: MarkdownRendererProps): MarkdownRendererAPI {
  const { content, components, linkResolver } = props

  const html = parseMarkdown(content, linkResolver)
  const extractedComponents = extractComponents(content, components)

  const ariaProps: Partial<AccessibilityProps> = {
    role: 'document',
    'aria-label': 'Rendered markdown content',
  }

  return {
    html,
    components: extractedComponents,
    ariaProps,
  }
}
