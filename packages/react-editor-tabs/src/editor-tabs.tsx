import * as React from 'react'
import {
  createEditorTabs,
  getNextTabIndex,
  editorTabsVariants,
  editorTabVariants,
  editorTabDirtyDotClass,
  editorTabCloseButtonClass,
  editorTabIconClass,
  type EditorTabData,
} from '@refraction-ui/editor-tabs'
import { cn } from '@refraction-ui/shared'

export type { EditorTabData }

export interface EditorTabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** The list of tab entries to render. */
  tabs: EditorTabData[]
  /** The id of the currently active tab (controlled). */
  activeId: string
  /** Called when the user clicks or navigates to a tab. */
  onSelect: (id: string) => void
  /** Called when the user clicks the close button on a tab. */
  onClose?: (id: string) => void
}

/**
 * EditorTabs — an IDE-style open-file tab bar.
 *
 * Renders `role="tablist"`; each tab is `role="tab"` with `aria-selected`.
 * Supports optional icons, dirty-state dots, and close buttons. Keyboard
 * navigation uses wrapping roving tabindex (ArrowLeft/Right, Home/End) via the
 * headless `@refraction-ui/editor-tabs` core helper.
 */
export const EditorTabs = React.forwardRef<HTMLDivElement, EditorTabsProps>(
  ({ tabs, activeId, onSelect, onClose, className, ...props }, ref) => {
    const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([])

    const activeIndex = tabs.findIndex((t) => t.id === activeId)
    // If nothing is active, make the first tab tabbable.
    const tabbableIndex = activeIndex === -1 ? 0 : activeIndex

    const handleKeyDown = (
      event: React.KeyboardEvent<HTMLButtonElement>,
      index: number,
    ) => {
      const next = getNextTabIndex(index, event.key, tabs.length)
      if (next !== index) {
        event.preventDefault()
        onSelect(tabs[next].id)
        tabRefs.current[next]?.focus()
      }
    }

    const api = createEditorTabs({ activeId })

    return (
      <div
        ref={ref}
        className={cn(editorTabsVariants(), className)}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeId
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={index === tabbableIndex ? 0 : -1}
              data-state={isActive ? 'active' : 'inactive'}
              className={editorTabVariants({ state: isActive ? 'active' : 'inactive' })}
              onClick={() => onSelect(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              {tab.icon && (
                <span className={editorTabIconClass} aria-hidden="true">
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.dirty && (
                <span
                  className={editorTabDirtyDotClass}
                  aria-label="unsaved changes"
                  role="status"
                />
              )}
              {tab.closable && (
                <span
                  role="button"
                  aria-label={`Close ${tab.label}`}
                  tabIndex={-1}
                  className={editorTabCloseButtonClass}
                  onClick={(e) => {
                    e.stopPropagation()
                    onClose?.(tab.id)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation()
                      onClose?.(tab.id)
                    }
                  }}
                >
                  ×
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  },
)

EditorTabs.displayName = 'EditorTabs'
