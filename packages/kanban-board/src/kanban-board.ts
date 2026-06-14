/** A single column definition for the Kanban board. */
export type KanbanColumnDef = {
  /** Unique identifier for this column (matches cards' column id). */
  id: string
  /** Display title of the column (e.g. stage name). */
  title: string
  /** Optional accent color applied via CSS var `--kanban-accent`. */
  accent?: string
  /** Optional note or gate description shown below the column header. */
  note?: string
}

export interface KanbanBoardAPI {
  /** ARIA attributes to spread on the board container. */
  ariaProps: { role: 'group'; 'aria-label': string }
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic board props.
 *
 * Returns `role="group"` with a fixed accessible label and data attributes
 * so adapters can style based on state without inlining logic.
 */
export function createKanbanBoard(): KanbanBoardAPI {
  return {
    ariaProps: {
      role: 'group',
      'aria-label': 'Board',
    },
    dataAttributes: {
      'data-component': 'kanban-board',
    },
  }
}

/**
 * Bucket cards into a Map keyed by column id, preserving column order.
 * Columns that have no cards get an empty array entry so callers can always
 * iterate `columns` and look up their bucket safely.
 *
 * @param cards - All cards to distribute.
 * @param getColumnId - Selector that reads the column id from a card.
 * @param columns - Column definitions (determines output order).
 */
export function cardsByColumn<T>(
  cards: T[],
  getColumnId: (c: T) => string,
  columns: KanbanColumnDef[],
): Map<string, T[]> {
  const map = new Map<string, T[]>()
  // Pre-populate every column so empty columns are present.
  for (const col of columns) {
    map.set(col.id, [])
  }
  for (const card of cards) {
    const colId = getColumnId(card)
    const bucket = map.get(colId)
    if (bucket !== undefined) {
      bucket.push(card)
    }
    // Cards referencing unknown columns are silently dropped.
  }
  return map
}

/**
 * Split a card list into a visible slice and an overflow count.
 *
 * @param cards - Full list of cards in the column.
 * @param cap - Maximum visible cards. Defaults to 5.
 */
export function visibleAndOverflow<T>(
  cards: T[],
  cap = 5,
): { visible: T[]; overflow: number } {
  if (cards.length <= cap) {
    return { visible: cards, overflow: 0 }
  }
  return { visible: cards.slice(0, cap), overflow: cards.length - cap }
}
