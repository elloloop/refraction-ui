import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as MetaExports from '../src/index.js'
import * as FormExports from '../src/form.js'
import * as ThemeExports from '../src/theme.js'

const testDir = dirname(fileURLToPath(import.meta.url))

function listDeclarationFiles(dir: string): string[] {
  const files: string[] = []

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...listDeclarationFiles(path))
      continue
    }

    if (entry.name.endsWith('.d.ts') || entry.name.endsWith('.d.cts')) {
      files.push(path)
    }
  }

  return files
}

describe('@refraction-ui/react (meta package)', () => {
  it('exports Button from react-button', () => {
    expect(MetaExports.Button).toBeDefined()
  })

  it('exports buttonVariants from react-button', () => {
    expect(MetaExports.buttonVariants).toBeDefined()
  })

  it('exports Input from react-input', () => {
    expect(MetaExports.Input).toBeDefined()
  })

  it('exports Textarea from react-textarea', () => {
    expect(MetaExports.Textarea).toBeDefined()
  })

  it('exports Dialog compound components from react-dialog', () => {
    expect(MetaExports.Dialog).toBeDefined()
    expect(MetaExports.DialogTrigger).toBeDefined()
    expect(MetaExports.DialogContent).toBeDefined()
    expect(MetaExports.DialogClose).toBeDefined()
  })

  it('exposes ThemeProvider via @refraction-ui/react/theme subpath', () => {
    expect(ThemeExports.ThemeProvider).toBeDefined()
  })

  it('exposes useTheme hook via @refraction-ui/react/theme subpath', () => {
    expect(ThemeExports.useTheme).toBeDefined()
    expect(typeof ThemeExports.useTheme).toBe('function')
  })

  it('does NOT export ThemeProvider from main entry (opt-in only)', () => {
    expect((MetaExports as Record<string, unknown>).ThemeProvider).toBeUndefined()
  })

  it('does NOT export RHF-backed Form from main entry (opt-in only)', () => {
    expect((MetaExports as Record<string, unknown>).Form).toBeUndefined()
    expect((MetaExports as Record<string, unknown>).useForm).toBeUndefined()
  })

  it('exposes RHF-backed Form via @refraction-ui/react/form subpath', () => {
    expect(FormExports.Form).toBeDefined()
    expect(FormExports.FormField).toBeDefined()
    expect(FormExports.useForm).toBeDefined()
  })

  it('exports Sheet compound components from react-sheet', () => {
    expect(MetaExports.Sheet).toBeDefined()
    expect(MetaExports.SheetTrigger).toBeDefined()
    expect(MetaExports.SheetContent).toBeDefined()
    expect(MetaExports.SheetClose).toBeDefined()
  })

  it('exports Tabs compound components from react-tabs', () => {
    expect(MetaExports.Tabs).toBeDefined()
    expect(MetaExports.TabsList).toBeDefined()
    expect(MetaExports.TabsTrigger).toBeDefined()
    expect(MetaExports.TabsContent).toBeDefined()
  })

  it('exports Toast components from react-toast', () => {
    expect(MetaExports.ToastProvider).toBeDefined()
    expect(MetaExports.useToast).toBeDefined()
    expect(MetaExports.Toast).toBeDefined()
    expect(MetaExports.Toaster).toBeDefined()
  })

  it('exports Sidebar from react-sidebar', () => {
    expect(MetaExports.Sidebar).toBeDefined()
  })

  it('exports SlideViewer from react-slide-viewer', () => {
    expect(MetaExports.SlideViewer).toBeDefined()
  })

  it('exports LanguageSelector from react-language-selector', () => {
    expect(MetaExports.LanguageSelector).toBeDefined()
  })

  it('exports VersionSelector from react-version-selector', () => {
    expect(MetaExports.VersionSelector).toBeDefined()
  })

  it('provides renamed aliases for conflicting exports', () => {
    // progressBarVariants from react-progress-display (original)
    expect(MetaExports.progressBarVariants).toBeDefined()
    // progressBarVariants from react-slide-viewer (renamed)
    expect(MetaExports.slideViewerProgressBarVariants).toBeDefined()
    // optionVariants from react-language-selector (original)
    expect(MetaExports.optionVariants).toBeDefined()
    // optionVariants from react-version-selector (renamed)
    expect(MetaExports.versionSelectorOptionVariants).toBeDefined()
  })

  it('exports a large number of symbols (sanity check)', () => {
    const exportedKeys = Object.keys(MetaExports)
    // With 39 active packages, we should have many exports
    expect(exportedKeys.length).toBeGreaterThan(30)
  })

  it('does not leak react-hook-form or private re-export specifiers from the built root entry', () => {
    const distDir = join(testDir, '..', 'dist')
    const rootJs = readFileSync(join(distDir, 'index.js'), 'utf8')
    const rootTypes = readFileSync(join(distDir, 'index.d.ts'), 'utf8')

    expect(rootJs).not.toContain('react-hook-form')
    expect(rootJs).not.toContain('@monaco-editor/react')
    expect(rootTypes).not.toContain('react-hook-form')
    expect(rootTypes).not.toMatch(/from ['"]@refraction-ui\//)
  })

  it('keeps react-hook-form isolated to the built form subpath', () => {
    const distDir = join(testDir, '..', 'dist')
    const formJs = readFileSync(join(distDir, 'form.js'), 'utf8')
    const formTypes = readFileSync(join(distDir, 'form.d.ts'), 'utf8')
    const internalFormTypes = readFileSync(
      join(distDir, 'internal', 'react-form', 'index.d.ts'),
      'utf8'
    )

    expect(formJs).toContain('react-hook-form')
    expect(formTypes).not.toContain('react-hook-form')
    expect(internalFormTypes).toContain('react-hook-form')
    expect(formTypes).not.toMatch(/from ['"]@refraction-ui\//)
  })

  it('ships embedded declarations instead of public references to private packages', () => {
    const distDir = join(testDir, '..', 'dist')
    const declarationText = listDeclarationFiles(distDir)
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n')

    expect(declarationText).not.toMatch(/from ['"]@refraction-ui\//)
    expect(declarationText).not.toMatch(/import\(['"]@refraction-ui\//)
  })
})
