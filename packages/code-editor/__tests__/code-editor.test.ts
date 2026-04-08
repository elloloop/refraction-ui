import { describe, it, expect, vi } from 'vitest'
import { createCodeEditor } from '../src/code-editor.js'
import { codeEditorVariants } from '../src/code-editor.styles.js'

describe('createCodeEditor', () => {
  it('returns default state', () => {
    const api = createCodeEditor()
    expect(api.state.value).toBe('')
    expect(api.state.language).toBe('plaintext')
    expect(api.state.theme).toBe('light')
  })

  it('accepts initial value', () => {
    const api = createCodeEditor({ value: 'const x = 1' })
    expect(api.state.value).toBe('const x = 1')
  })

  it('accepts language prop', () => {
    const api = createCodeEditor({ language: 'typescript' })
    expect(api.state.language).toBe('typescript')
  })

  it('accepts theme prop', () => {
    const api = createCodeEditor({ theme: 'dark' })
    expect(api.state.theme).toBe('dark')
  })

  describe('setValue', () => {
    it('updates the value in state', () => {
      const api = createCodeEditor()
      api.setValue('new value')
      expect(api.state.value).toBe('new value')
    })

    it('calls onChange when value changes', () => {
      const onChange = vi.fn()
      const api = createCodeEditor({ onChange })
      api.setValue('hello')
      expect(onChange).toHaveBeenCalledWith('hello')
    })
  })

  describe('getLanguageLabel', () => {
    it('returns human-readable label for known languages', () => {
      expect(createCodeEditor({ language: 'js' }).getLanguageLabel()).toBe('JavaScript')
      expect(createCodeEditor({ language: 'typescript' }).getLanguageLabel()).toBe('TypeScript')
      expect(createCodeEditor({ language: 'py' }).getLanguageLabel()).toBe('Python')
      expect(createCodeEditor({ language: 'go' }).getLanguageLabel()).toBe('Go')
      expect(createCodeEditor({ language: 'rust' }).getLanguageLabel()).toBe('Rust')
    })

    it('capitalizes unknown language names', () => {
      expect(createCodeEditor({ language: 'fortran' }).getLanguageLabel()).toBe('Fortran')
    })
  })

  describe('ariaProps', () => {
    it('returns textbox role with multiline', () => {
      const api = createCodeEditor()
      expect(api.ariaProps.role).toBe('textbox')
      expect(api.ariaProps['aria-multiline']).toBe(true)
    })

    it('includes language in aria-label', () => {
      const api = createCodeEditor({ language: 'python' })
      expect(api.ariaProps['aria-label']).toContain('Python')
    })

    it('sets aria-readonly when readOnly is true', () => {
      const api = createCodeEditor({ readOnly: true })
      expect(api.ariaProps).toHaveProperty('aria-readonly', true)
    })
  })

  describe('dataAttributes', () => {
    it('includes language and theme', () => {
      const api = createCodeEditor({ language: 'css', theme: 'dark' })
      expect(api.dataAttributes['data-language']).toBe('css')
      expect(api.dataAttributes['data-theme']).toBe('dark')
    })

    it('includes data-readonly when readOnly', () => {
      const api = createCodeEditor({ readOnly: true })
      expect(api.dataAttributes['data-readonly']).toBe('')
    })

    it('does not include data-readonly when not readOnly', () => {
      const api = createCodeEditor()
      expect(api.dataAttributes).not.toHaveProperty('data-readonly')
    })
  })
})

describe('codeEditorVariants', () => {
  it('returns default classes', () => {
    const classes = codeEditorVariants()
    expect(classes).toContain('font-mono')
    expect(classes).toContain('bg-white')
  })

  it('returns dark theme classes', () => {
    const classes = codeEditorVariants({ theme: 'dark' })
    expect(classes).toContain('bg-gray-900')
  })

  it('appends custom className', () => {
    const classes = codeEditorVariants({ className: 'my-editor' })
    expect(classes).toContain('my-editor')
  })
})
