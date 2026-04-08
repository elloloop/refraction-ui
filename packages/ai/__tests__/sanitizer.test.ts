import { describe, it, expect } from 'vitest'
import { sanitizeForSpeech } from '../src/sanitizer.js'

describe('sanitizeForSpeech', () => {
  // --- Markdown stripping ---
  describe('markdown stripping', () => {
    it('strips bold **text**', () => {
      expect(sanitizeForSpeech('This is **bold** text')).toBe('This is bold text')
    })

    it('strips bold __text__', () => {
      expect(sanitizeForSpeech('This is __bold__ text')).toBe('This is bold text')
    })

    it('strips italic *text*', () => {
      expect(sanitizeForSpeech('This is *italic* text')).toBe('This is italic text')
    })

    it('strips italic _text_', () => {
      expect(sanitizeForSpeech('This is _italic_ text')).toBe('This is italic text')
    })

    it('strips strikethrough ~~text~~', () => {
      expect(sanitizeForSpeech('This is ~~deleted~~ text')).toBe('This is deleted text')
    })

    it('strips inline code `text`', () => {
      expect(sanitizeForSpeech('Use `console.log` here')).toBe('Use console.log here')
    })

    it('strips code blocks ```text```', () => {
      expect(sanitizeForSpeech('```\nconst x = 1\n```')).toBe('const x = 1')
    })

    it('strips code blocks with language specifier', () => {
      expect(sanitizeForSpeech('```javascript\nconst x = 1\n```')).toBe('const x = 1')
    })

    it('strips heading markers #', () => {
      expect(sanitizeForSpeech('# Heading One')).toBe('Heading One')
    })

    it('strips heading markers ## through ######', () => {
      expect(sanitizeForSpeech('## Heading Two')).toBe('Heading Two')
      expect(sanitizeForSpeech('### Heading Three')).toBe('Heading Three')
      expect(sanitizeForSpeech('###### Heading Six')).toBe('Heading Six')
    })

    it('strips unordered list markers -', () => {
      expect(sanitizeForSpeech('- item one\n- item two')).toBe('item one\nitem two')
    })

    it('strips unordered list markers *', () => {
      expect(sanitizeForSpeech('* item one\n* item two')).toBe('item one\nitem two')
    })

    it('strips ordered list markers', () => {
      expect(sanitizeForSpeech('1. first\n2. second\n3. third')).toBe('first\nsecond\nthird')
    })

    it('strips links [text](url) keeping text', () => {
      expect(sanitizeForSpeech('Click [here](https://example.com) now')).toBe('Click here now')
    })

    it('strips images ![alt](url)', () => {
      expect(sanitizeForSpeech('See ![image](https://img.com/photo.png)')).toBe('See image')
    })

    it('strips blockquotes >', () => {
      expect(sanitizeForSpeech('> This is a quote')).toBe('This is a quote')
    })

    it('strips horizontal rules ---', () => {
      const result = sanitizeForSpeech('above\n---\nbelow')
      expect(result).not.toContain('---')
      expect(result).toContain('above')
      expect(result).toContain('below')
    })

    it('strips horizontal rules ***', () => {
      const result = sanitizeForSpeech('above\n***\nbelow')
      expect(result).not.toMatch(/^\*{3,}$/m)
      expect(result).toContain('above')
      expect(result).toContain('below')
    })

    it('strips table pipes', () => {
      expect(sanitizeForSpeech('| col1 | col2 |')).toContain('col1')
      expect(sanitizeForSpeech('| col1 | col2 |')).toContain('col2')
    })

    it('strips table separator lines', () => {
      const input = '| head |\n|---|\n| data |'
      const result = sanitizeForSpeech(input)
      expect(result).not.toContain('---')
      expect(result).toContain('head')
      expect(result).toContain('data')
    })
  })

  // --- LaTeX conversion ---
  describe('LaTeX conversion', () => {
    it('converts \\frac{1}{2} to one half', () => {
      const result = sanitizeForSpeech('The answer is \\frac{1}{2}')
      expect(result).toContain('one half')
    })

    it('converts \\frac{a}{b} to a over b', () => {
      const result = sanitizeForSpeech('\\frac{a}{b}')
      expect(result).toContain('a over b')
    })

    it('strips inline LaTeX $...$', () => {
      const result = sanitizeForSpeech('The equation $x + y = z$ is simple')
      expect(result).toContain('x + y = z')
      expect(result).not.toContain('$')
    })

    it('strips display LaTeX $$...$$', () => {
      const result = sanitizeForSpeech('$$E = mc^2$$')
      expect(result).not.toContain('$$')
    })

    it('converts \\sqrt{x} to square root of x', () => {
      const result = sanitizeForSpeech('\\sqrt{16}')
      expect(result).toContain('square root of 16')
    })

    it('converts superscript ^{2} to squared', () => {
      const result = sanitizeForSpeech('x^{2}')
      expect(result).toContain('squared')
    })

    it('converts superscript ^{3} to cubed', () => {
      const result = sanitizeForSpeech('x^{3}')
      expect(result).toContain('cubed')
    })

    it('converts \\pi to pi', () => {
      const result = sanitizeForSpeech('\\pi r^{2}')
      expect(result).toContain('pi')
    })

    it('converts \\alpha to alpha', () => {
      expect(sanitizeForSpeech('\\alpha')).toContain('alpha')
    })

    it('converts \\beta to beta', () => {
      expect(sanitizeForSpeech('\\beta')).toContain('beta')
    })

    it('converts \\theta to theta', () => {
      expect(sanitizeForSpeech('\\theta')).toContain('theta')
    })

    it('converts \\sum to sum', () => {
      expect(sanitizeForSpeech('\\sum_{i=1}^{n}')).toContain('sum')
    })

    it('converts \\int to integral', () => {
      expect(sanitizeForSpeech('\\int_{0}^{1}')).toContain('integral')
    })

    it('converts \\infty to infinity', () => {
      expect(sanitizeForSpeech('\\infty')).toContain('infinity')
    })

    it('converts \\times to times', () => {
      expect(sanitizeForSpeech('2 \\times 3')).toContain('times')
    })

    it('converts \\div to divided by', () => {
      expect(sanitizeForSpeech('6 \\div 2')).toContain('divided by')
    })

    it('converts \\pm to plus or minus', () => {
      expect(sanitizeForSpeech('\\pm 5')).toContain('plus or minus')
    })

    it('converts \\neq to not equal to', () => {
      expect(sanitizeForSpeech('x \\neq y')).toContain('not equal to')
    })

    it('converts \\leq to less than or equal to', () => {
      expect(sanitizeForSpeech('x \\leq y')).toContain('less than or equal to')
    })

    it('converts \\geq to greater than or equal to', () => {
      expect(sanitizeForSpeech('x \\geq y')).toContain('greater than or equal to')
    })

    it('strips \\left and \\right delimiters', () => {
      const result = sanitizeForSpeech('\\left( x + y \\right)')
      expect(result).not.toContain('\\left')
      expect(result).not.toContain('\\right')
    })

    it('strips \\text{} keeping content', () => {
      const result = sanitizeForSpeech('\\text{hello world}')
      expect(result).toContain('hello world')
    })

    it('strips \\mathrm{} keeping content', () => {
      const result = sanitizeForSpeech('\\mathrm{kg}')
      expect(result).toContain('kg')
    })

    it('strips curly braces used in LaTeX grouping', () => {
      const result = sanitizeForSpeech('{x} + {y}')
      expect(result).toContain('x')
      expect(result).toContain('y')
      // Should not have stray braces
      expect(result).not.toContain('{')
      expect(result).not.toContain('}')
    })
  })

  // --- HTML stripping ---
  describe('HTML stripping', () => {
    it('strips simple HTML tags', () => {
      expect(sanitizeForSpeech('<b>bold</b>')).toBe('bold')
    })

    it('strips nested HTML tags', () => {
      expect(sanitizeForSpeech('<div><p>text</p></div>')).toBe('text')
    })

    it('strips self-closing tags', () => {
      expect(sanitizeForSpeech('line1<br/>line2')).toBe('line1line2')
    })

    it('strips tags with attributes', () => {
      expect(sanitizeForSpeech('<a href="url">link</a>')).toBe('link')
    })

    it('strips HTML comments', () => {
      expect(sanitizeForSpeech('visible <!-- hidden --> text')).toBe('visible text')
    })
  })

  // --- Whitespace normalization ---
  describe('whitespace normalization', () => {
    it('collapses multiple spaces', () => {
      expect(sanitizeForSpeech('hello    world')).toBe('hello world')
    })

    it('trims leading and trailing whitespace', () => {
      expect(sanitizeForSpeech('  hello  ')).toBe('hello')
    })

    it('normalizes multiple newlines', () => {
      const result = sanitizeForSpeech('hello\n\n\n\nworld')
      expect(result).toBe('hello\n\nworld')
    })
  })

  // --- Edge cases ---
  describe('edge cases', () => {
    it('handles empty string', () => {
      expect(sanitizeForSpeech('')).toBe('')
    })

    it('handles string with only whitespace', () => {
      expect(sanitizeForSpeech('   ')).toBe('')
    })

    it('handles plain text with no formatting', () => {
      expect(sanitizeForSpeech('Hello world')).toBe('Hello world')
    })

    it('handles mixed markdown and HTML', () => {
      const result = sanitizeForSpeech('**bold** and <i>italic</i>')
      expect(result).toBe('bold and italic')
    })

    it('handles complex real-world AI response', () => {
      const input = `## Summary

Here's the **key point**: The formula $E = mc^{2}$ shows that energy equals mass times the speed of light squared.

- First item
- Second item

> Important quote

Visit [our site](https://example.com) for more.`

      const result = sanitizeForSpeech(input)
      expect(result).not.toContain('##')
      expect(result).not.toContain('**')
      expect(result).not.toContain('$')
      expect(result).not.toContain('[')
      expect(result).not.toContain('](')
      expect(result).not.toContain('>')
      expect(result).toContain('Summary')
      expect(result).toContain('key point')
      expect(result).toContain('First item')
    })

    it('preserves sentence structure after stripping', () => {
      const result = sanitizeForSpeech('I need to **emphasize** this _important_ word.')
      expect(result).toBe('I need to emphasize this important word.')
    })
  })
})
