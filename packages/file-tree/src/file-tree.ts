/**
 * @refraction-ui/file-tree — headless tree view.
 *
 * Owns the *behavior* of a hierarchical tree: the node model, expand/collapse
 * state, single selection, roving focus, and WAI-ARIA treeview keyboard
 * semantics. It has NO UI opinion — adapters render the nested markup and
 * spread the ARIA objects.
 */

/** A node in the tree. Parents carry `children`; leaves do not. */
export interface FileTreeNode {
  /** Unique, stable id (used for expansion/selection/focus). */
  id: string
  /** Display label. */
  label: string
  /** Child nodes — presence (even empty is not allowed: omit for leaves) marks a parent. */
  children?: FileTreeNode[]
  /** Disabled nodes cannot be selected, toggled, or focused via click. */
  disabled?: boolean
}

/** Options for {@link createFileTree}. */
export interface FileTreeConfig {
  /** Root-level nodes. */
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
  /** Accessible label for the tree (default `'File tree'`). */
  'aria-label'?: string
}

/** Snapshot of the store. Returned by `getState()`; treat as immutable. */
export interface FileTreeState {
  nodes: FileTreeNode[]
  expandedIds: string[]
  selectedId: string | null
  /** Node holding the roving-tabindex focus (null = the first visible item). */
  focusedId: string | null
}

/** A row of the flattened, currently-visible tree (DFS order). */
export interface VisibleTreeItem {
  node: FileTreeNode
  /** Id of the parent node, or null for root-level items. */
  parentId: string | null
  /** 1-based nesting depth (ARIA `aria-level`). */
  depth: number
  hasChildren: boolean
  isExpanded: boolean
  isSelected: boolean
  isFocused: boolean
}

/** The framework-agnostic store. React/Astro adapters wrap this. */
export interface FileTreeAPI {
  /** Current immutable snapshot */
  getState(): FileTreeState
  /** Subscribe to changes; returns an unsubscribe fn (suits useSyncExternalStore) */
  subscribe(listener: () => void): () => void

  /** Flattened visible rows in DFS order (children of collapsed parents omitted) */
  getVisibleItems(): VisibleTreeItem[]
  isExpanded(id: string): boolean
  /** Toggle a parent's expanded state (no-op for leaves/disabled nodes) */
  toggle(id: string): void
  expand(id: string): void
  collapse(id: string): void
  /** Select a node (`null` clears). No-op for unknown/disabled nodes. */
  select(id: string | null): void
  /** Move the roving focus to a node */
  focus(id: string | null): void
  /**
   * WAI-ARIA treeview keyboard semantics, applied to the focused item:
   * ArrowDown/Up move, ArrowRight expands or descends, ArrowLeft collapses or
   * ascends, Home/End jump, Enter/Space selects.
   */
  handleKey(key: string): void

  /** Replace the node model (adapters sync the prop) */
  setNodes(nodes: FileTreeNode[]): void
  /** Sync a controlled expanded set */
  setExpandedIds(ids: string[]): void
  /** Sync a controlled selection */
  setSelectedId(id: string | null): void
  /** Update callbacks/options after creation */
  setOptions(options: {
    onExpandedChange?: (ids: string[]) => void
    onSelectionChange?: (id: string | null) => void
    'aria-label'?: string
  }): void

  /** ARIA attributes for the tree container (`role="tree"`). */
  getTreeAria(): Record<string, string | number | boolean>
  /** ARIA attributes for one visible row (`role="treeitem"`). */
  getItemAria(item: VisibleTreeItem): Record<string, string | number | boolean>
}

function arrayEquals(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

/**
 * createFileTree — headless tree store with expand/collapse, single
 * selection, roving focus, and treeview keyboard semantics. Supports
 * controlled (`expandedIds` / `selectedId`) and uncontrolled
 * (`defaultExpandedIds` / `defaultSelectedId`) usage.
 */
export function createFileTree(config: FileTreeConfig = {}): FileTreeAPI {
  let nodes: FileTreeNode[] = config.nodes ?? []
  let ariaLabel = config['aria-label'] ?? 'File tree'
  let onExpandedChange = config.onExpandedChange
  let onSelectionChange = config.onSelectionChange

  let uncontrolledExpanded: string[] = config.defaultExpandedIds ?? []
  let controlledExpanded: string[] | undefined = config.expandedIds
  let uncontrolledSelected: string | null = config.defaultSelectedId ?? null
  let controlledSelected: string | null | undefined = config.selectedId
  let focusedId: string | null = null

  // Indexes rebuilt whenever the node model changes.
  let parentById = new Map<string, string | null>()
  let nodeById = new Map<string, FileTreeNode>()

  function reindex(): void {
    parentById = new Map()
    nodeById = new Map()
    const walk = (list: FileTreeNode[], parentId: string | null) => {
      for (const node of list) {
        nodeById.set(node.id, node)
        parentById.set(node.id, parentId)
        if (node.children) walk(node.children, node.id)
      }
    }
    walk(nodes, null)
  }
  reindex()

  const listeners = new Set<() => void>()
  let snapshot: FileTreeState = buildSnapshot()
  let visibleItems: VisibleTreeItem[] = buildVisibleItems()

  function expandedIds(): string[] {
    return controlledExpanded !== undefined ? controlledExpanded : uncontrolledExpanded
  }

  function selectedId(): string | null {
    return controlledSelected !== undefined ? controlledSelected : uncontrolledSelected
  }

  function buildSnapshot(): FileTreeState {
    return {
      nodes,
      expandedIds: expandedIds(),
      selectedId: selectedId(),
      focusedId,
    }
  }

  function buildVisibleItems(): VisibleTreeItem[] {
    const expanded = new Set(expandedIds())
    const selected = selectedId()
    const items: VisibleTreeItem[] = []
    const walk = (list: FileTreeNode[], parentId: string | null, depth: number) => {
      for (const node of list) {
        const hasChildren = Boolean(node.children && node.children.length > 0)
        const isExpanded = hasChildren && expanded.has(node.id)
        items.push({
          node,
          parentId,
          depth,
          hasChildren,
          isExpanded,
          isSelected: node.id === selected,
          isFocused: node.id === focusedId,
        })
        if (hasChildren && isExpanded) walk(node.children!, node.id, depth + 1)
      }
    }
    walk(nodes, null, 1)
    return items
  }

  function emit(): void {
    snapshot = buildSnapshot()
    visibleItems = buildVisibleItems()
    for (const l of listeners) l()
  }

  function setExpanded(ids: string[]): void {
    if (controlledExpanded === undefined) {
      if (arrayEquals(uncontrolledExpanded, ids)) return
      uncontrolledExpanded = ids
    }
    onExpandedChange?.(ids)
    emit()
  }

  function isExpandable(id: string): boolean {
    const node = nodeById.get(id)
    return Boolean(node && !node.disabled && node.children && node.children.length > 0)
  }

  const api: FileTreeAPI = {
    getState() {
      return snapshot
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    getVisibleItems() {
      return visibleItems
    },

    isExpanded(id) {
      return expandedIds().includes(id)
    },

    toggle(id) {
      if (!isExpandable(id)) return
      const current = expandedIds()
      setExpanded(current.includes(id) ? current.filter((v) => v !== id) : [...current, id])
    },

    expand(id) {
      if (!isExpandable(id)) return
      const current = expandedIds()
      if (current.includes(id)) return
      setExpanded([...current, id])
    },

    collapse(id) {
      const current = expandedIds()
      if (!current.includes(id)) return
      setExpanded(current.filter((v) => v !== id))
    },

    select(id) {
      if (id !== null) {
        const node = nodeById.get(id)
        if (!node || node.disabled) return
      }
      if (controlledSelected === undefined) {
        if (uncontrolledSelected === id) return
        uncontrolledSelected = id
      }
      onSelectionChange?.(id)
      emit()
    },

    focus(id) {
      // Focus is only meaningful on rows that are actually rendered.
      if (id !== null && !visibleItems.some((i) => i.node.id === id)) return
      if (focusedId === id) return
      focusedId = id
      emit()
    },

    handleKey(key) {
      const items = visibleItems
      if (items.length === 0) return
      const currentIndex = focusedId ? items.findIndex((i) => i.node.id === focusedId) : -1

      switch (key) {
        case 'ArrowDown':
          api.focus(items[Math.min(currentIndex + 1, items.length - 1)]!.node.id)
          return
        case 'ArrowUp':
          api.focus(items[Math.max(currentIndex - 1, 0)]!.node.id)
          return
        case 'Home':
          api.focus(items[0]!.node.id)
          return
        case 'End':
          api.focus(items[items.length - 1]!.node.id)
          return
        case 'ArrowRight': {
          const item = currentIndex === -1 ? undefined : items[currentIndex]
          if (!item) {
            api.focus(items[0]!.node.id)
            return
          }
          if (!item.hasChildren) return
          if (!item.isExpanded) api.expand(item.node.id)
          // Expanded: descend to the first child (DFS order puts it next).
          else api.focus(items[currentIndex + 1]?.node.id ?? item.node.id)
          return
        }
        case 'ArrowLeft': {
          const item = currentIndex === -1 ? undefined : items[currentIndex]
          if (!item) return
          if (item.hasChildren && item.isExpanded) api.collapse(item.node.id)
          else if (item.parentId) api.focus(item.parentId)
          return
        }
        case 'Enter':
        case ' ': {
          const item = currentIndex === -1 ? undefined : items[currentIndex]
          if (item) api.select(item.node.id)
          return
        }
        default:
          return
      }
    },

    setNodes(nextNodes) {
      nodes = nextNodes
      reindex()
      emit()
    },

    setExpandedIds(ids) {
      if (controlledExpanded !== undefined && arrayEquals(controlledExpanded, ids)) return
      controlledExpanded = ids
      emit()
    },

    setSelectedId(id) {
      if (controlledSelected !== undefined && controlledSelected === id) return
      controlledSelected = id
      emit()
    },

    setOptions(options) {
      if (options.onExpandedChange !== undefined) onExpandedChange = options.onExpandedChange
      if (options.onSelectionChange !== undefined) onSelectionChange = options.onSelectionChange
      if (options['aria-label'] !== undefined) ariaLabel = options['aria-label']
    },

    getTreeAria(): Record<string, string | number | boolean> {
      return { role: 'tree', 'aria-label': ariaLabel }
    },

    getItemAria(item): Record<string, string | number | boolean> {
      const aria: Record<string, string | number | boolean> = {
        role: 'treeitem',
        'aria-level': item.depth,
        'aria-selected': item.isSelected,
      }
      if (item.hasChildren) aria['aria-expanded'] = item.isExpanded
      if (item.node.disabled) aria['aria-disabled'] = true
      return aria
    },
  }

  return api
}
