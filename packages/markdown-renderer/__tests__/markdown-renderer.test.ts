import { describe, it, expect } from 'vitest'
import { createMarkdownRenderer } from '../src/markdown-renderer.js'
import { proseVariants } from '../src/markdown-renderer.styles.js'

describe('createMarkdownRenderer', () => {
  describe('headings', () => {
    it('parses h1', () => {
      const api = createMarkdownRenderer({ content: '# Hello' })
      expect(api.html).toContain('<h1>Hello</h1>')
    })

    it('parses h2', () => {
      const api = createMarkdownRenderer({ content: '## Subtitle' })
      expect(api.html).toContain('<h2>Subtitle</h2>')
    })

    it('parses h3 through h6', () => {
      const api = createMarkdownRenderer({ content: '### H3\n#### H4\n##### H5\n###### H6' })
      expect(api.html).toContain('<h3>H3</h3>')
      expect(api.html).toContain('<h4>H4</h4>')
      expect(api.html).toContain('<h5>H5</h5>')
      expect(api.html).toContain('<h6>H6</h6>')
    })
  })

  describe('bold', () => {
    it('parses **bold** text', () => {
      const api = createMarkdownRenderer({ content: 'This is **bold** text' })
      expect(api.html).toContain('<strong>bold</strong>')
    })

    it('parses __bold__ text', () => {
      const api = createMarkdownRenderer({ content: 'This is __bold__ text' })
      expect(api.html).toContain('<strong>bold</strong>')
    })
  })

  describe('italic', () => {
    it('parses *italic* text', () => {
      const api = createMarkdownRenderer({ content: 'This is *italic* text' })
      expect(api.html).toContain('<em>italic</em>')
    })

    it('parses _italic_ text', () => {
      const api = createMarkdownRenderer({ content: 'This is _italic_ text' })
      expect(api.html).toContain('<em>italic</em>')
    })
  })

  describe('links', () => {
    it('parses [text](url) links', () => {
      const api = createMarkdownRenderer({ content: 'Visit [Google](https://google.com)' })
      expect(api.html).toContain('<a href="https://google.com">Google</a>')
    })

    it('applies linkResolver to URLs', () => {
      const api = createMarkdownRenderer({
        content: 'Visit [Docs](/docs)',
        linkResolver: (url) => `https://example.com${url}`,
      })
      expect(api.html).toContain('<a href="https://example.com/docs">Docs</a>')
    })
  })

  describe('inline code', () => {
    it('parses `code` backticks', () => {
      const api = createMarkdownRenderer({ content: 'Use `console.log` here' })
      expect(api.html).toContain('<code>console.log</code>')
    })
  })

  describe('code blocks', () => {
    it('parses fenced code blocks', () => {
      const api = createMarkdownRenderer({ content: '```js\nconst x = 1\n```' })
      expect(api.html).toContain('<pre><code class="language-js">')
      expect(api.html).toContain('const x = 1')
      expect(api.html).toContain('</code></pre>')
    })

    it('parses code blocks without language', () => {
      const api = createMarkdownRenderer({ content: '```\nhello\n```' })
      expect(api.html).toContain('<pre><code>')
      expect(api.html).toContain('hello')
    })
  })

  describe('lists', () => {
    it('parses unordered lists with -', () => {
      const api = createMarkdownRenderer({ content: '- Item 1\n- Item 2\n- Item 3' })
      expect(api.html).toContain('<ul>')
      expect(api.html).toContain('<li>Item 1</li>')
      expect(api.html).toContain('<li>Item 2</li>')
      expect(api.html).toContain('<li>Item 3</li>')
      expect(api.html).toContain('</ul>')
    })

    it('parses ordered lists', () => {
      const api = createMarkdownRenderer({ content: '1. First\n2. Second\n3. Third' })
      expect(api.html).toContain('<ol>')
      expect(api.html).toContain('<li>First</li>')
      expect(api.html).toContain('<li>Second</li>')
      expect(api.html).toContain('<li>Third</li>')
      expect(api.html).toContain('</ol>')
    })
  })

  describe('blockquotes', () => {
    it('parses > blockquotes', () => {
      const api = createMarkdownRenderer({ content: '> This is a quote' })
      expect(api.html).toContain('<blockquote>')
      expect(api.html).toContain('This is a quote')
      expect(api.html).toContain('</blockquote>')
    })

    it('parses multi-line blockquotes', () => {
      const api = createMarkdownRenderer({ content: '> Line 1\n> Line 2' })
      expect(api.html).toContain('<blockquote>')
      expect(api.html).toContain('Line 1')
      expect(api.html).toContain('Line 2')
    })
  })

  describe('horizontal rules', () => {
    it('parses --- as horizontal rule', () => {
      const api = createMarkdownRenderer({ content: 'Before\n\n---\n\nAfter' })
      expect(api.html).toContain('<hr />')
    })
  })

  describe('component extraction', () => {
    it('extracts custom components from content', () => {
      const api = createMarkdownRenderer({
        content: 'Hello {{alert}} world',
        components: {
          alert: {
            type: 'alert',
            pattern: /\{\{alert\}\}/g,
            props: { variant: 'warning' },
          },
        },
      })
      expect(api.components).toHaveLength(1)
      expect(api.components[0].name).toBe('alert')
      expect(api.components[0].props.variant).toBe('warning')
    })

    it('returns empty array when no components defined', () => {
      const api = createMarkdownRenderer({ content: 'Hello world' })
      expect(api.components).toEqual([])
    })
  })

  describe('aria props', () => {
    it('returns document role and label', () => {
      const api = createMarkdownRenderer({ content: 'Hello' })
      expect(api.ariaProps.role).toBe('document')
      expect(api.ariaProps['aria-label']).toBe('Rendered markdown content')
    })
  })

  describe('HTML escaping', () => {
    it('escapes HTML entities in regular text', () => {
      const api = createMarkdownRenderer({ content: 'Use <div> and & symbols' })
      expect(api.html).toContain('&lt;div&gt;')
      expect(api.html).toContain('&amp;')
    })
  })
})

describe('proseVariants', () => {
  it('returns default classes', () => {
    const classes = proseVariants()
    expect(classes).toContain('prose')
    expect(classes).toContain('text-base')
  })

  it('returns size variants', () => {
    expect(proseVariants({ size: 'sm' })).toContain('text-sm')
    expect(proseVariants({ size: 'lg' })).toContain('text-lg')
  })

  it('appends custom className', () => {
    const classes = proseVariants({ className: 'my-custom' })
    expect(classes).toContain('my-custom')
  })
})
