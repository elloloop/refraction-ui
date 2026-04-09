import type { AccessibilityProps } from '@refraction-ui/shared'

export type CodeEditorTheme = 'light' | 'dark'

export interface CodeEditorProps {
  value?: string
  onChange?: (value: string) => void
  language?: string
  readOnly?: boolean
  theme?: CodeEditorTheme
}

export interface CodeEditorState {
  value: string
  language: string
  theme: CodeEditorTheme
}

export interface CodeEditorAPI {
  /** Current editor state */
  state: CodeEditorState
  /** ARIA attributes for the editor element */
  ariaProps: Partial<AccessibilityProps> & { 'aria-multiline'?: boolean }
  /** Data attributes for CSS styling hooks */
  dataAttributes: Record<string, string>
  /** Update the editor value */
  setValue: (value: string) => void
  /** Get a human-readable label for the current language */
  getLanguageLabel: () => string
}

/** Map of language identifiers to human-readable labels */
const languageLabels: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  py: 'Python',
  python: 'Python',
  rb: 'Ruby',
  ruby: 'Ruby',
  go: 'Go',
  rust: 'Rust',
  rs: 'Rust',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  cs: 'C#',
  csharp: 'C#',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  md: 'Markdown',
  markdown: 'Markdown',
  sql: 'SQL',
  sh: 'Shell',
  bash: 'Bash',
  zsh: 'Zsh',
  xml: 'XML',
  toml: 'TOML',
  swift: 'Swift',
  kotlin: 'Kotlin',
  dart: 'Dart',
  php: 'PHP',
  lua: 'Lua',
  r: 'R',
  scala: 'Scala',
}

/**
 * Create a headless code editor API.
 *
 * This provides the headless interface for a code editor — state management,
 * ARIA props, and data attributes. Actual rendering (Monaco, CodeMirror, or
 * a simple textarea) is handled by framework-specific wrappers.
 */
export function createCodeEditor(props: CodeEditorProps = {}): CodeEditorAPI {
  const {
    value = '',
    onChange,
    language = 'plaintext',
    readOnly = false,
    theme = 'light',
  } = props

  let currentValue = value

  const state: CodeEditorState = {
    value: currentValue,
    language,
    theme,
  }

  const ariaProps: Partial<AccessibilityProps> & { 'aria-multiline'?: boolean; 'aria-readonly'?: boolean } = {
    role: 'textbox',
    'aria-multiline': true,
    'aria-label': `Code editor - ${getLabel(language)}`,
  }

  if (readOnly) {
    ariaProps['aria-readonly'] = true
  }

  const dataAttributes: Record<string, string> = {
    'data-language': language,
    'data-theme': theme,
  }

  if (readOnly) {
    dataAttributes['data-readonly'] = ''
  }

  function setValue(newValue: string) {
    currentValue = newValue
    state.value = newValue
    if (onChange) {
      onChange(newValue)
    }
  }

  function getLabel(lang: string): string {
    return languageLabels[lang.toLowerCase()] ?? lang.charAt(0).toUpperCase() + lang.slice(1)
  }

  function getLanguageLabel(): string {
    return getLabel(language)
  }

  return {
    state,
    ariaProps,
    dataAttributes,
    setValue,
    getLanguageLabel,
  }
}
