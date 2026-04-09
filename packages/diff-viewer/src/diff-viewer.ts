import type { AccessibilityProps } from '@elloloop/shared'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DiffViewerTheme = 'light' | 'dark'
export type DiffViewMode = 'side-by-side' | 'inline'

export type DiffFileStatus = 'added' | 'modified' | 'deleted' | 'renamed'

export interface DiffFile {
  /** File path */
  path: string
  /** Change status */
  status: DiffFileStatus
  /** Lines added */
  additions: number
  /** Lines deleted */
  deletions: number
  /** Unified diff content for this file */
  diff?: string
  /** Old path for renamed files */
  oldPath?: string
}

export interface DiffViewerProps {
  /** Files in this diff */
  files?: DiffFile[]
  /** Index of the active file */
  activeFileIndex?: number
  /** View mode */
  viewMode?: DiffViewMode
  /** Theme */
  theme?: DiffViewerTheme
  /** Language for syntax highlighting */
  language?: string
  /** Whether the sidebar is visible */
  sidebarOpen?: boolean
  /** Callback when active file changes */
  onFileSelect?: (index: number) => void
  /** Callback when view mode changes */
  onViewModeChange?: (mode: DiffViewMode) => void
  /** Callback when sidebar toggled */
  onSidebarToggle?: () => void
}

export interface DiffViewerState {
  activeFileIndex: number
  viewMode: DiffViewMode
  theme: DiffViewerTheme
  language: string
  sidebarOpen: boolean
  files: DiffFile[]
}

export interface DiffViewerAPI {
  /** Current viewer state */
  state: DiffViewerState
  /** ARIA attributes for the root element */
  ariaProps: Partial<AccessibilityProps> & Record<string, unknown>
  /** Data attributes for CSS styling hooks */
  dataAttributes: Record<string, string>
  /** Select a file by index */
  selectFile: (index: number) => void
  /** Move to next file */
  nextFile: () => void
  /** Move to previous file */
  prevFile: () => void
  /** Toggle view mode */
  toggleViewMode: () => void
  /** Toggle sidebar */
  toggleSidebar: () => void
  /** Get language label for a file path */
  getLanguageForFile: (path: string) => string
  /** Get human-readable file status icon */
  getFileStatusIcon: (status: DiffFileStatus) => string
  /** Get total additions across all files */
  totalAdditions: () => number
  /** Get total deletions across all files */
  totalDeletions: () => number
}

// ---------------------------------------------------------------------------
// Language detection
// ---------------------------------------------------------------------------

const extToLanguage: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  go: 'go',
  rs: 'rust',
  rb: 'ruby',
  java: 'java',
  swift: 'swift',
  kt: 'kotlin',
  dart: 'dart',
  php: 'php',
  lua: 'lua',
  r: 'r',
  scala: 'scala',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  md: 'markdown',
  html: 'html',
  css: 'css',
  scss: 'scss',
  sql: 'sql',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  xml: 'xml',
  toml: 'toml',
  proto: 'protobuf',
  dockerfile: 'dockerfile',
  cpp: 'cpp',
  c: 'c',
}

function getLanguageForFile(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || ''
  const basename = filePath.split('/').pop()?.toLowerCase() || ''
  if (basename === 'dockerfile') return 'dockerfile'
  return extToLanguage[ext] || 'plaintext'
}

// ---------------------------------------------------------------------------
// Status icons
// ---------------------------------------------------------------------------

const statusIcons: Record<DiffFileStatus, string> = {
  added: '\u{1F7E2}',    // green circle
  modified: '\u{1F7E1}', // yellow circle
  deleted: '\u{1F534}',  // red circle
  renamed: '\u{1F535}',  // blue circle
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a headless diff viewer API.
 *
 * Manages file selection, view mode, sidebar state, and produces ARIA/data
 * attributes. The actual rendering (Monaco DiffEditor, custom renderer, etc.)
 * is handled by framework-specific wrappers.
 */
export function createDiffViewer(props: DiffViewerProps = {}): DiffViewerAPI {
  const {
    files = [],
    activeFileIndex = 0,
    viewMode = 'side-by-side',
    theme = 'dark',
    language,
    sidebarOpen = true,
    onFileSelect,
    onViewModeChange,
    onSidebarToggle,
  } = props

  let currentIndex = Math.min(activeFileIndex, Math.max(0, files.length - 1))
  let currentViewMode = viewMode
  let currentSidebarOpen = sidebarOpen

  const state: DiffViewerState = {
    activeFileIndex: currentIndex,
    viewMode: currentViewMode,
    theme,
    language: language || (files[currentIndex] ? getLanguageForFile(files[currentIndex].path) : 'plaintext'),
    sidebarOpen: currentSidebarOpen,
    files,
  }

  const ariaProps: Partial<AccessibilityProps> & Record<string, unknown> = {
    role: 'region',
    'aria-label': 'Diff viewer',
  }

  const dataAttributes: Record<string, string> = {
    'data-view-mode': currentViewMode,
    'data-theme': theme,
    'data-file-count': String(files.length),
  }

  if (!currentSidebarOpen) {
    dataAttributes['data-sidebar-collapsed'] = ''
  }

  function selectFile(index: number) {
    if (index >= 0 && index < files.length) {
      currentIndex = index
      state.activeFileIndex = index
      state.language = language || getLanguageForFile(files[index].path)
      onFileSelect?.(index)
    }
  }

  function nextFile() {
    if (currentIndex < files.length - 1) {
      selectFile(currentIndex + 1)
    }
  }

  function prevFile() {
    if (currentIndex > 0) {
      selectFile(currentIndex - 1)
    }
  }

  function toggleViewMode() {
    currentViewMode = currentViewMode === 'side-by-side' ? 'inline' : 'side-by-side'
    state.viewMode = currentViewMode
    dataAttributes['data-view-mode'] = currentViewMode
    onViewModeChange?.(currentViewMode)
  }

  function toggleSidebar() {
    currentSidebarOpen = !currentSidebarOpen
    state.sidebarOpen = currentSidebarOpen
    if (currentSidebarOpen) {
      delete dataAttributes['data-sidebar-collapsed']
    } else {
      dataAttributes['data-sidebar-collapsed'] = ''
    }
    onSidebarToggle?.()
  }

  function totalAdditions(): number {
    return files.reduce((sum, f) => sum + f.additions, 0)
  }

  function totalDeletions(): number {
    return files.reduce((sum, f) => sum + f.deletions, 0)
  }

  return {
    state,
    ariaProps,
    dataAttributes,
    selectFile,
    nextFile,
    prevFile,
    toggleViewMode,
    toggleSidebar,
    getLanguageForFile,
    getFileStatusIcon: (status: DiffFileStatus) => statusIcons[status] || '\u{26AA}',
    totalAdditions,
    totalDeletions,
  }
}
