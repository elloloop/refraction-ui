/**
 * sanitizeForSpeech — converts AI-generated text (with markdown, LaTeX, HTML)
 * into clean, speakable plain text suitable for TTS engines.
 *
 * 30+ regex-based transformation rules applied in order.
 */
export function sanitizeForSpeech(text: string): string {
  if (!text) return ''

  let result = text

  // === HTML ===

  // 1. Strip HTML comments
  result = result.replace(/<!--[\s\S]*?-->/g, '')

  // 2. Strip HTML tags (including self-closing)
  result = result.replace(/<[^>]+>/g, '')

  // === Code blocks (before other markdown to avoid interference) ===

  // 3. Strip fenced code blocks (``` with optional language)
  result = result.replace(/```[\w]*\n?([\s\S]*?)```/g, '$1')

  // 4. Strip inline code backticks
  result = result.replace(/`([^`]+)`/g, '$1')

  // === LaTeX (before markdown to handle $ delimiters) ===

  // 5. Strip display math $$...$$
  result = result.replace(/\$\$([\s\S]*?)\$\$/g, '$1')

  // 6. Strip inline math $...$
  result = result.replace(/\$([^$]+)\$/g, '$1')

  // 7. Common fractions
  result = result.replace(/\\frac\{1\}\{2\}/g, 'one half')
  result = result.replace(/\\frac\{1\}\{3\}/g, 'one third')
  result = result.replace(/\\frac\{1\}\{4\}/g, 'one quarter')
  result = result.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2')

  // 8. Square root
  result = result.replace(/\\sqrt\{([^}]+)\}/g, 'square root of $1')

  // 9. Superscripts (special cases)
  result = result.replace(/\^\{2\}/g, ' squared')
  result = result.replace(/\^\{3\}/g, ' cubed')
  result = result.replace(/\^\{([^}]+)\}/g, ' to the power of $1')

  // 10. Subscripts
  result = result.replace(/_\{([^}]+)\}/g, ' sub $1')

  // 11. Greek letters
  result = result.replace(/\\alpha/g, 'alpha')
  result = result.replace(/\\beta/g, 'beta')
  result = result.replace(/\\gamma/g, 'gamma')
  result = result.replace(/\\delta/g, 'delta')
  result = result.replace(/\\theta/g, 'theta')
  result = result.replace(/\\lambda/g, 'lambda')
  result = result.replace(/\\mu/g, 'mu')
  result = result.replace(/\\sigma/g, 'sigma')
  result = result.replace(/\\omega/g, 'omega')
  result = result.replace(/\\pi/g, 'pi')
  result = result.replace(/\\phi/g, 'phi')

  // 12. Operators
  result = result.replace(/\\times/g, 'times')
  result = result.replace(/\\div/g, 'divided by')
  result = result.replace(/\\pm/g, 'plus or minus')
  result = result.replace(/\\cdot/g, 'dot')

  // 13. Relations
  result = result.replace(/\\neq/g, 'not equal to')
  result = result.replace(/\\leq/g, 'less than or equal to')
  result = result.replace(/\\geq/g, 'greater than or equal to')
  result = result.replace(/\\approx/g, 'approximately')
  result = result.replace(/\\equiv/g, 'equivalent to')

  // 14. Special symbols
  result = result.replace(/\\infty/g, 'infinity')
  result = result.replace(/\\partial/g, 'partial')

  // 15. Summation and integrals
  result = result.replace(/\\sum/g, 'sum')
  result = result.replace(/\\prod/g, 'product')
  result = result.replace(/\\int/g, 'integral')
  result = result.replace(/\\lim/g, 'limit')

  // 16. Trig functions
  result = result.replace(/\\sin/g, 'sin')
  result = result.replace(/\\cos/g, 'cos')
  result = result.replace(/\\tan/g, 'tan')
  result = result.replace(/\\log/g, 'log')
  result = result.replace(/\\ln/g, 'ln')

  // 17. Text commands (keep content)
  result = result.replace(/\\text\{([^}]+)\}/g, '$1')
  result = result.replace(/\\mathrm\{([^}]+)\}/g, '$1')
  result = result.replace(/\\mathbf\{([^}]+)\}/g, '$1')
  result = result.replace(/\\mathit\{([^}]+)\}/g, '$1')

  // 18. Delimiters
  result = result.replace(/\\left/g, '')
  result = result.replace(/\\right/g, '')
  result = result.replace(/\\big/g, '')
  result = result.replace(/\\Big/g, '')

  // 19. Strip remaining LaTeX commands (\word)
  result = result.replace(/\\[a-zA-Z]+/g, '')

  // 20. Strip LaTeX curly braces (but keep content)
  result = result.replace(/\{([^}]*)\}/g, '$1')
  // Handle any remaining stray braces
  result = result.replace(/[{}]/g, '')

  // === Markdown ===

  // 21. Strip images ![alt](url)
  result = result.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')

  // 22. Strip links [text](url) keeping text
  result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // 23. Strip bold **text** and __text__
  result = result.replace(/\*\*([^*]+)\*\*/g, '$1')
  result = result.replace(/__([^_]+)__/g, '$1')

  // 24. Strip italic *text* and _text_
  result = result.replace(/\*([^*]+)\*/g, '$1')
  result = result.replace(/(?<!\w)_([^_]+)_(?!\w)/g, '$1')

  // 25. Strip strikethrough ~~text~~
  result = result.replace(/~~([^~]+)~~/g, '$1')

  // 26. Strip headings (# to ######)
  result = result.replace(/^#{1,6}\s+/gm, '')

  // 27. Strip blockquotes
  result = result.replace(/^>\s+/gm, '')

  // 28. Strip unordered list markers (- or * at line start)
  result = result.replace(/^[-*]\s+/gm, '')

  // 29. Strip ordered list markers (1. 2. etc.)
  result = result.replace(/^\d+\.\s+/gm, '')

  // 30. Strip horizontal rules (---, ***, ___)
  result = result.replace(/^[-*_]{3,}\s*$/gm, '')

  // 31. Strip table separator lines (|---|---|)
  result = result.replace(/^\|[-:\s|]+\|\s*$/gm, '')

  // 32. Strip table pipes (keep cell content)
  result = result.replace(/\|/g, ' ')

  // === Whitespace normalization ===

  // 33. Collapse multiple spaces to single space
  result = result.replace(/ {2,}/g, ' ')

  // 34. Normalize excessive newlines (3+ -> 2)
  result = result.replace(/\n{3,}/g, '\n\n')

  // 35. Trim each line
  result = result
    .split('\n')
    .map((line) => line.trim())
    .join('\n')

  // 36. Remove empty lines at start/end
  result = result.trim()

  return result
}
