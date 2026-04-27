import { describe, it, expect } from 'vitest'
import * as MetaExports from '../src/index.js'
import * as ThemeExports from '../src/theme.js'

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
})
