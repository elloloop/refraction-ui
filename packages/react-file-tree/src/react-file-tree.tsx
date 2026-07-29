import * as React from 'react'
import { cn } from '@refraction-ui/shared'
import {
  createFileTree,
  fileTreeVariants,
  fileTreeItemVariants,
  fileTreeGlyphClass,
  type FileTreeAPI,
  type FileTreeNode,
  type FileTreeState,
  type VisibleTreeItem,
} from '@refraction-ui/file-tree'

export type { FileTreeNode }

export interface FileTreeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Root-level nodes of the tree. */
  nodes?: FileTreeNode[]
  /** Controlled expanded node ids. Pair with `onExpandedChange`. */
  expandedIds?: string[]
  /** Uncontrolled initial expanded node ids. */
  defaultExpandedIds?: string[]
  /** Controlled selected node id (`null` = none). Pair with `onSelectionChange`. */
  selectedId?: string | null
  /** Uncontrolled initial selected node id. */
  defaultSelectedId?: string | null
  /** Called whenever the expanded set changes. */
  onExpandedChange?: (ids: string[]) => void
  /** Called whenever the selection changes. */
  onSelectionChange?: (id: string | null) => void
}

/** Keys the tree handles itself (WAI-ARIA treeview pattern). */
const HANDLED_KEYS = new Set([
  'ArrowDown',
  'ArrowUp',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'Enter',
  ' ',
])

interface TreeItemsProps {
  nodes: FileTreeNode[]
  depth: number
  api: FileTreeAPI
  state: FileTreeState
  firstVisibleId: string | undefined
}

function TreeItems({ nodes, depth, api, state, firstVisibleId }: TreeItemsProps) {
  return (
    <>
      {nodes.map((node) => {
        const hasChildren = Boolean(node.children && node.children.length > 0)
        const isExpanded = hasChildren && state.expandedIds.includes(node.id)
        const isSelected = state.selectedId === node.id
        const item: VisibleTreeItem = {
          node,
          parentId: null, // unused by getItemAria; the core tracks real parents
          depth,
          hasChildren,
          isExpanded,
          isSelected,
          isFocused: state.focusedId === node.id,
        }
        const tabbable =
          state.focusedId === node.id || (state.focusedId === null && node.id === firstVisibleId)

        return (
          <li key={node.id} role="none" className="list-none">
            <div
              {...api.getItemAria(item)}
              tabIndex={tabbable ? 0 : -1}
              data-disabled={node.disabled ? 'true' : undefined}
              style={{ paddingLeft: `${(depth - 1) * 12}px` }}
              className={fileTreeItemVariants({ selected: isSelected ? 'true' : 'false' })}
              onClick={() => {
                api.focus(node.id)
                api.select(node.id)
                if (hasChildren) api.toggle(node.id)
              }}
              onFocus={() => api.focus(node.id)}
            >
              <span aria-hidden="true" className={fileTreeGlyphClass}>
                {hasChildren ? (isExpanded ? '▾' : '▸') : '·'}
              </span>
              <span className="truncate">{node.label}</span>
            </div>
            {hasChildren && isExpanded && (
              <ul role="group" className="m-0 p-0">
                <TreeItems
                  nodes={node.children!}
                  depth={depth + 1}
                  api={api}
                  state={state}
                  firstVisibleId={firstVisibleId}
                />
              </ul>
            )}
          </li>
        )
      })}
    </>
  )
}

/**
 * FileTree — a hierarchical file/folder tree view.
 *
 * Renders `role="tree"` with nested `role="group"`/`role="treeitem"` rows,
 * expand/collapse, single selection, roving tabindex, and WAI-ARIA treeview
 * keyboard navigation. All behavior comes from the headless
 * `@refraction-ui/file-tree` core; supports controlled (`expandedIds` /
 * `selectedId`) and uncontrolled usage.
 */
export const FileTree = React.forwardRef<HTMLDivElement, FileTreeProps>(
  function FileTree(
    {
      className,
      nodes = [],
      expandedIds: controlledExpandedIds,
      defaultExpandedIds,
      selectedId: controlledSelectedId,
      defaultSelectedId,
      onExpandedChange,
      onSelectionChange,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) {
    // The headless core owns expansion/selection/focus; it is created once and
    // props are synced into it below.
    const apiRef = React.useRef<FileTreeAPI | null>(null)
    if (apiRef.current === null) {
      apiRef.current = createFileTree({
        nodes,
        expandedIds: controlledExpandedIds,
        defaultExpandedIds,
        selectedId: controlledSelectedId,
        defaultSelectedId,
        onExpandedChange,
        onSelectionChange,
        'aria-label': ariaLabel,
      })
    }
    const api = apiRef.current

    const state = React.useSyncExternalStore(api.subscribe, api.getState, api.getState)

    React.useEffect(() => {
      api.setOptions({ onExpandedChange, onSelectionChange, 'aria-label': ariaLabel })
    })
    React.useEffect(() => {
      api.setNodes(nodes)
    }, [api, nodes])
    React.useEffect(() => {
      if (controlledExpandedIds !== undefined) api.setExpandedIds(controlledExpandedIds)
    }, [api, controlledExpandedIds])
    React.useEffect(() => {
      if (controlledSelectedId !== undefined) api.setSelectedId(controlledSelectedId)
    }, [api, controlledSelectedId])

    const firstVisibleId = api.getVisibleItems()[0]?.node.id

    return (
      <div ref={ref} className={cn(fileTreeVariants(), className)} {...props}>
        <ul
          {...api.getTreeAria()}
          className="m-0 p-0"
          onKeyDown={(event) => {
            if (!HANDLED_KEYS.has(event.key)) return
            event.preventDefault()
            api.handleKey(event.key)
          }}
        >
          <TreeItems
            nodes={state.nodes}
            depth={1}
            api={api}
            state={state}
            firstVisibleId={firstVisibleId}
          />
        </ul>
      </div>
    )
  },
)
