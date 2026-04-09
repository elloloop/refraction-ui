import * as React from 'react'
import {
  createDiffViewer,
  diffViewerVariants,
  sidebarVariants,
  sidebarItemVariants,
  tabBarVariants,
  tabVariants,
  statusBarVariants,
  type DiffFile,
  type DiffViewerTheme,
  type DiffViewMode,
} from '@elloloop/diff-viewer'
import { cn } from '@elloloop/shared'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DiffViewerProps {
  /** Files in this diff */
  files: DiffFile[]
  /** Original file content (left side) */
  original?: string
  /** Modified file content (right side) */
  modified?: string
  /** Language for syntax highlighting (auto-detected from file if omitted) */
  language?: string
  /** Monaco theme name */
  monacoTheme?: string
  /** Color theme */
  theme?: DiffViewerTheme
  /** View mode */
  viewMode?: DiffViewMode
  /** Whether to show the file sidebar */
  showSidebar?: boolean
  /** Whether to show the tab bar */
  showTabs?: boolean
  /** Whether to show the status bar */
  showStatusBar?: boolean
  /** Sidebar width in pixels */
  sidebarWidth?: number
  /** Active file index */
  activeFileIndex?: number
  /** Called when the active file changes */
  onFileSelect?: (index: number) => void
  /** Called when view mode changes */
  onViewModeChange?: (mode: DiffViewMode) => void
  /** Title shown in the status bar */
  statusBarTitle?: string
  /** Status text shown in the status bar */
  statusBarStatus?: string
  /** Additional class name */
  className?: string
  /** Monaco DiffEditor options override */
  editorOptions?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Lazy Monaco import
// ---------------------------------------------------------------------------

const MonacoDiffEditor = React.lazy(() =>
  import('@monaco-editor/react').then((m) => ({ default: m.DiffEditor })),
)

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const DiffViewer = React.forwardRef<HTMLDivElement, DiffViewerProps>(
  (
    {
      files,
      original = '',
      modified = '',
      language,
      monacoTheme = 'vs-dark',
      theme = 'dark',
      viewMode: controlledViewMode = 'side-by-side',
      showSidebar = true,
      showTabs = true,
      showStatusBar = true,
      sidebarWidth = 220,
      activeFileIndex: controlledIndex = 0,
      onFileSelect,
      onViewModeChange,
      statusBarTitle,
      statusBarStatus,
      className,
      editorOptions,
    },
    ref,
  ) => {
    const [activeIdx, setActiveIdx] = React.useState(controlledIndex)
    const [sidebarOpen, setSidebarOpen] = React.useState(showSidebar)
    const [viewMode, setViewMode] = React.useState<DiffViewMode>(controlledViewMode)

    // Sync controlled props
    React.useEffect(() => setActiveIdx(controlledIndex), [controlledIndex])
    React.useEffect(() => setViewMode(controlledViewMode), [controlledViewMode])

    const api = React.useMemo(
      () =>
        createDiffViewer({
          files,
          activeFileIndex: activeIdx,
          viewMode,
          theme,
          language,
          sidebarOpen,
          onFileSelect: (i: number) => {
            setActiveIdx(i)
            onFileSelect?.(i)
          },
          onViewModeChange: (m: DiffViewMode) => {
            setViewMode(m)
            onViewModeChange?.(m)
          },
          onSidebarToggle: () => setSidebarOpen((s) => !s),
        }),
      [files, activeIdx, viewMode, theme, language, sidebarOpen, onFileSelect, onViewModeChange],
    )

    const activeFile = files[activeIdx]
    const detectedLang = language || (activeFile ? api.getLanguageForFile(activeFile.path) : 'plaintext')

    // Keyboard navigation
    React.useEffect(() => {
      function onKey(e: KeyboardEvent) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
        if (e.key === 'j') {
          setActiveIdx((i) => {
            const next = Math.min(i + 1, files.length - 1)
            onFileSelect?.(next)
            return next
          })
        } else if (e.key === 'k') {
          setActiveIdx((i) => {
            const prev = Math.max(i - 1, 0)
            onFileSelect?.(prev)
            return prev
          })
        } else if (e.key === 'b') {
          setSidebarOpen((s) => !s)
        }
      }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }, [files.length, onFileSelect])

    return (
      <div
        ref={ref}
        className={cn(diffViewerVariants({ theme, fullscreen: 'true' }), className)}
        {...api.ariaProps}
        {...api.dataAttributes}
      >
        {/* Main area: sidebar + editor */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* File sidebar */}
          {sidebarOpen && (
            <div className={sidebarVariants({ theme })} style={{ width: sidebarWidth }}>
              <div className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Files ({files.length})
              </div>
              {files.map((f, i) => {
                const active = i === activeIdx
                const fname = f.path.split('/').pop() || f.path
                const dir = f.path.split('/').slice(0, -1).join('/')
                return (
                  <div
                    key={f.path}
                    onClick={() => {
                      setActiveIdx(i)
                      onFileSelect?.(i)
                    }}
                    className={sidebarItemVariants({ active: active ? 'true' : 'false', theme })}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-[10px]">{api.getFileStatusIcon(f.status)}</span>
                      <span className={active ? '' : 'opacity-70'}>{fname}</span>
                      <span className="ml-auto text-[10px]">
                        <span className="text-green-500">+{f.additions}</span>
                        {f.deletions > 0 && <span className="text-red-500">-{f.deletions}</span>}
                      </span>
                    </div>
                    {dir && (
                      <div className="text-[10px] opacity-50 mt-0.5 pl-4">{dir}</div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Editor area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Tab bar */}
            {showTabs && activeFile && (
              <div className={tabBarVariants({ theme })}>
                {files.map((f, i) => {
                  const active = i === activeIdx
                  const fname = f.path.split('/').pop() || f.path
                  return (
                    <div
                      key={f.path}
                      onClick={() => {
                        setActiveIdx(i)
                        onFileSelect?.(i)
                      }}
                      className={tabVariants({ active: active ? 'true' : 'false', theme })}
                    >
                      <span className="text-[9px]">{api.getFileStatusIcon(f.status)}</span>
                      {fname}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Monaco DiffEditor */}
            <div style={{ flex: 1 }}>
              <React.Suspense
                fallback={
                  <div className="flex items-center justify-center h-full text-xs opacity-50">
                    Loading editor...
                  </div>
                }
              >
                <MonacoDiffEditor
                  original={original}
                  modified={modified}
                  language={detectedLang}
                  theme={monacoTheme}
                  options={{
                    readOnly: true,
                    renderSideBySide: viewMode === 'side-by-side',
                    minimap: { enabled: true, scale: 1, showSlider: 'mouseover' },
                    fontSize: 13,
                    lineHeight: 20,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, monospace",
                    fontLigatures: true,
                    scrollBeyondLastLine: false,
                    renderOverviewRuler: true,
                    scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
                    padding: { top: 8, bottom: 8 },
                    renderWhitespace: 'selection',
                    bracketPairColorization: { enabled: true },
                    guides: { indentation: true },
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    ...editorOptions,
                  }}
                />
              </React.Suspense>
            </div>
          </div>
        </div>

        {/* Status bar */}
        {showStatusBar && (
          <div className={statusBarVariants({ theme })}>
            {statusBarTitle && <span>{statusBarTitle}</span>}
            {activeFile && <span>{activeFile.path}</span>}
            <span style={{ marginLeft: 'auto' }}>
              +{api.totalAdditions()} -{api.totalDeletions()}
            </span>
            {statusBarStatus && <span>{statusBarStatus}</span>}
            <span>
              {files.length} {files.length === 1 ? 'file' : 'files'}
            </span>
          </div>
        )}
      </div>
    )
  },
)

DiffViewer.displayName = 'DiffViewer'
