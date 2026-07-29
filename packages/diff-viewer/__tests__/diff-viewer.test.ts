import { describe, it, expect, vi } from 'vitest'
import { createDiffViewer, type DiffFile } from '../src/index.js'

function makeFiles(): DiffFile[] {
  return [
    { path: 'src/app.ts', status: 'modified', additions: 10, deletions: 2 },
    { path: 'README.md', status: 'added', additions: 20, deletions: 0 },
    { path: 'old/util.py', status: 'deleted', additions: 0, deletions: 15 },
  ]
}

describe('createDiffViewer — initial state', () => {
  it('applies defaults: side-by-side, dark theme, sidebar open, first file active', () => {
    const api = createDiffViewer({ files: makeFiles() })
    expect(api.state.viewMode).toBe('side-by-side')
    expect(api.state.theme).toBe('dark')
    expect(api.state.sidebarOpen).toBe(true)
    expect(api.state.activeFileIndex).toBe(0)
  })

  it('derives the language from the active file when none is given', () => {
    const api = createDiffViewer({ files: makeFiles() })
    expect(api.state.language).toBe('typescript')
  })

  it('falls back to plaintext with no files', () => {
    const api = createDiffViewer()
    expect(api.state.language).toBe('plaintext')
    expect(api.state.files).toEqual([])
  })

  it('clamps an out-of-range initial activeFileIndex to the last file', () => {
    const api = createDiffViewer({ files: makeFiles(), activeFileIndex: 99 })
    expect(api.state.activeFileIndex).toBe(2)
    expect(api.state.language).toBe('python')
  })

  it('honors an explicit language override', () => {
    const api = createDiffViewer({ files: makeFiles(), language: 'go' })
    expect(api.state.language).toBe('go')
  })

  it('exposes region ARIA props and initial data attributes', () => {
    const api = createDiffViewer({ files: makeFiles(), theme: 'light' })
    expect(api.ariaProps.role).toBe('region')
    expect(api.ariaProps['aria-label']).toBe('Diff viewer')
    expect(api.dataAttributes['data-view-mode']).toBe('side-by-side')
    expect(api.dataAttributes['data-theme']).toBe('light')
    expect(api.dataAttributes['data-file-count']).toBe('3')
    expect(api.dataAttributes).not.toHaveProperty('data-sidebar-collapsed')
  })

  it('marks data-sidebar-collapsed when created with the sidebar closed', () => {
    const api = createDiffViewer({ files: makeFiles(), sidebarOpen: false })
    expect(api.state.sidebarOpen).toBe(false)
    expect(api.dataAttributes).toHaveProperty('data-sidebar-collapsed')
  })
})

describe('createDiffViewer — file selection', () => {
  it('selectFile updates the active index, language, and fires onFileSelect', () => {
    const onFileSelect = vi.fn()
    const api = createDiffViewer({ files: makeFiles(), onFileSelect })
    api.selectFile(1)
    expect(api.state.activeFileIndex).toBe(1)
    expect(api.state.language).toBe('markdown')
    expect(onFileSelect).toHaveBeenCalledWith(1)
  })

  it('ignores out-of-range selection (negative and past the end)', () => {
    const onFileSelect = vi.fn()
    const api = createDiffViewer({ files: makeFiles(), onFileSelect })
    api.selectFile(-1)
    api.selectFile(3)
    expect(api.state.activeFileIndex).toBe(0)
    expect(onFileSelect).not.toHaveBeenCalled()
  })

  it('nextFile/prevFile move within bounds', () => {
    const api = createDiffViewer({ files: makeFiles() })
    api.nextFile()
    expect(api.state.activeFileIndex).toBe(1)
    api.nextFile()
    expect(api.state.activeFileIndex).toBe(2)
    api.nextFile() // no-op at the end
    expect(api.state.activeFileIndex).toBe(2)
    api.prevFile()
    expect(api.state.activeFileIndex).toBe(1)
    api.prevFile()
    api.prevFile() // no-op at the start
    expect(api.state.activeFileIndex).toBe(0)
  })

  it('keeps the explicit language override when changing files', () => {
    const api = createDiffViewer({ files: makeFiles(), language: 'go' })
    api.selectFile(1)
    expect(api.state.language).toBe('go')
  })
})

describe('createDiffViewer — view mode and sidebar toggles', () => {
  it('toggleViewMode flips between side-by-side and inline and notifies', () => {
    const onViewModeChange = vi.fn()
    const api = createDiffViewer({ files: makeFiles(), onViewModeChange })
    api.toggleViewMode()
    expect(api.state.viewMode).toBe('inline')
    expect(api.dataAttributes['data-view-mode']).toBe('inline')
    expect(onViewModeChange).toHaveBeenCalledWith('inline')
    api.toggleViewMode()
    expect(api.state.viewMode).toBe('side-by-side')
    expect(onViewModeChange).toHaveBeenCalledWith('side-by-side')
  })

  it('toggleSidebar flips state and the collapsed data attribute and notifies', () => {
    const onSidebarToggle = vi.fn()
    const api = createDiffViewer({ files: makeFiles(), onSidebarToggle })
    api.toggleSidebar()
    expect(api.state.sidebarOpen).toBe(false)
    expect(api.dataAttributes).toHaveProperty('data-sidebar-collapsed')
    expect(onSidebarToggle).toHaveBeenCalledTimes(1)
    api.toggleSidebar()
    expect(api.state.sidebarOpen).toBe(true)
    expect(api.dataAttributes).not.toHaveProperty('data-sidebar-collapsed')
    expect(onSidebarToggle).toHaveBeenCalledTimes(2)
  })
})

describe('createDiffViewer — helpers', () => {
  it('maps file extensions to languages', () => {
    const api = createDiffViewer()
    expect(api.getLanguageForFile('a/b/component.tsx')).toBe('typescript')
    expect(api.getLanguageForFile('script.py')).toBe('python')
    expect(api.getLanguageForFile('STYLE.CSS')).toBe('css')
    expect(api.getLanguageForFile('config.yml')).toBe('yaml')
    expect(api.getLanguageForFile('mystery.xyz')).toBe('plaintext')
  })

  it('detects Dockerfile by basename regardless of extension', () => {
    const api = createDiffViewer()
    expect(api.getLanguageForFile('deploy/Dockerfile')).toBe('dockerfile')
  })

  it('returns a status icon per file status', () => {
    const api = createDiffViewer()
    expect(api.getFileStatusIcon('added')).toBe('\u{1F7E2}')
    expect(api.getFileStatusIcon('modified')).toBe('\u{1F7E1}')
    expect(api.getFileStatusIcon('deleted')).toBe('\u{1F534}')
    expect(api.getFileStatusIcon('renamed')).toBe('\u{1F535}')
  })

  it('sums additions and deletions across all files', () => {
    const api = createDiffViewer({ files: makeFiles() })
    expect(api.totalAdditions()).toBe(30)
    expect(api.totalDeletions()).toBe(17)
  })

  it('sums to zero with no files', () => {
    const api = createDiffViewer()
    expect(api.totalAdditions()).toBe(0)
    expect(api.totalDeletions()).toBe(0)
  })
})
