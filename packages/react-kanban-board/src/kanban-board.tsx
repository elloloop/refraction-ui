import * as React from 'react'
import {
  createKanbanBoard,
  cardsByColumn,
  visibleAndOverflow,
  kanbanBoardVariants,
  kanbanColumnVariants,
  kanbanColumnHeaderClass,
  kanbanColumnTitleClass,
  kanbanColumnCountClass,
  kanbanAccentBarClass,
  kanbanNoteBarClass,
  kanbanColumnBodyClass,
  kanbanOverflowButtonClass,
  kanbanCardVariants,
  type KanbanColumnDef,
} from '@refraction-ui/kanban-board'
import { cn } from '@refraction-ui/shared'

export type { KanbanColumnDef }

// ---------------------------------------------------------------------------
// KanbanCard
// ---------------------------------------------------------------------------

export interface KanbanCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'content'> {
  /** Optional accent color for a top border treatment (CSS color value). */
  accent?: string
  /** Whether the card should show hover/click affordance. */
  clickable?: boolean
}

/**
 * KanbanCard — the card surface inside a column.
 *
 * Renders a bordered `bg-card` block. Pass `clickable` for hover treatment and
 * an `onClick` handler for interaction. Children define the card content.
 */
export const KanbanCard = React.forwardRef<HTMLDivElement, KanbanCardProps>(
  ({ accent, clickable = false, className, style, children, ...props }, ref) => {
    const accentStyle: React.CSSProperties = accent
      ? { borderTopColor: accent, borderTopWidth: '2px', ...style }
      : (style ?? {})

    return (
      <div
        ref={ref}
        className={cn(
          kanbanCardVariants({ clickable: clickable ? 'true' : 'false' }),
          className,
        )}
        style={accentStyle}
        {...props}
      >
        {children}
      </div>
    )
  },
)
KanbanCard.displayName = 'KanbanCard'

// ---------------------------------------------------------------------------
// KanbanColumn
// ---------------------------------------------------------------------------

export interface KanbanColumnProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'content'> {
  /** Column definition (id, title, accent, note). */
  def: KanbanColumnDef
  /** Card count shown in the header badge. If omitted, derived from children. */
  count?: number
}

/**
 * KanbanColumn — a single stage column with a header and optional note bar.
 *
 * Place `<KanbanCard>` elements as children. The count badge is derived from
 * `React.Children.count(children)` when `count` is not provided.
 */
export const KanbanColumn = React.forwardRef<HTMLDivElement, KanbanColumnProps>(
  ({ def, count, className, children, style, ...props }, ref) => {
    const derivedCount =
      count !== undefined ? count : React.Children.count(children)

    const colStyle: React.CSSProperties = def.accent
      ? ({ '--kanban-accent': def.accent, ...style } as React.CSSProperties)
      : (style ?? {})

    return (
      <div
        ref={ref}
        className={cn(kanbanColumnVariants(), className)}
        style={colStyle}
        {...props}
      >
        {/* Header */}
        <div className={kanbanColumnHeaderClass}>
          <span className={kanbanColumnTitleClass}>{def.title}</span>
          <span className={kanbanColumnCountClass}>{derivedCount}</span>
        </div>

        {/* Accent bar */}
        <div
          className={kanbanAccentBarClass}
          style={
            def.accent
              ? { backgroundColor: 'var(--kanban-accent)' }
              : { backgroundColor: 'transparent' }
          }
          aria-hidden="true"
        />

        {/* Optional note/gate bar */}
        {def.note && (
          <p className={kanbanNoteBarClass}>{def.note}</p>
        )}

        {/* Card body */}
        <div className={kanbanColumnBodyClass}>{children}</div>
      </div>
    )
  },
)
KanbanColumn.displayName = 'KanbanColumn'

// ---------------------------------------------------------------------------
// KanbanBoard
// ---------------------------------------------------------------------------

export interface KanbanBoardProps<T>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'content' | 'onSelect' | 'results'> {
  /** Column definitions (order determines left-to-right render order). */
  columns: KanbanColumnDef[]
  /** All cards to distribute into columns. */
  cards: T[]
  /** Selector returning the column id for a card. */
  getCardColumnId: (card: T) => string
  /** Selector returning a unique React key for a card. */
  getCardKey: (card: T) => string
  /** Render a single card inside a column. */
  renderCard: (card: T, columnDef: KanbanColumnDef) => React.ReactNode
  /** Max visible cards per column before showing "+N more". Defaults to 5. */
  cardCap?: number
  /** Called when the user clicks a card (passed through to renderCard context). */
  onCardClick?: (card: T) => void
  /** Override the column header render. Receives the def and card count. */
  columnHeader?: (def: KanbanColumnDef, count: number) => React.ReactNode
  /** Called when the user taps "+N more" for a column. */
  onShowMore?: (columnId: string) => void
}

/**
 * KanbanBoard — a generic multi-column stage board.
 *
 * Distributes `cards` into columns defined by `columns` using `getCardColumnId`.
 * Each column caps at `cardCap` (default 5) visible cards and shows a
 * "+N more" button for the overflow.
 *
 * @example
 * ```tsx
 * <KanbanBoard
 *   columns={stages}
 *   cards={candidates}
 *   getCardColumnId={(c) => c.stageId}
 *   getCardKey={(c) => c.id}
 *   renderCard={(c) => <KanbanCard clickable>{c.name}</KanbanCard>}
 * />
 * ```
 */
export function KanbanBoard<T>({
  columns,
  cards,
  getCardColumnId,
  getCardKey,
  renderCard,
  cardCap = 5,
  onCardClick: _onCardClick,
  columnHeader,
  onShowMore,
  className,
  ...props
}: KanbanBoardProps<T>): React.ReactElement {
  const { ariaProps, dataAttributes } = createKanbanBoard()
  const buckets = cardsByColumn(cards, getCardColumnId, columns)

  return (
    <div
      className={cn(kanbanBoardVariants(), className)}
      {...ariaProps}
      {...dataAttributes}
      {...props}
    >
      {columns.map((def) => {
        const colCards = buckets.get(def.id) ?? []
        const { visible, overflow } = visibleAndOverflow(colCards, cardCap)
        const count = colCards.length

        const header = columnHeader ? columnHeader(def, count) : null

        return (
          <div
            key={def.id}
            className={kanbanColumnVariants()}
            style={
              def.accent
                ? ({ '--kanban-accent': def.accent } as React.CSSProperties)
                : undefined
            }
          >
            {/* Custom or default header */}
            {header ?? (
              <div className={kanbanColumnHeaderClass}>
                <span className={kanbanColumnTitleClass}>{def.title}</span>
                <span className={kanbanColumnCountClass}>{count}</span>
              </div>
            )}

            {/* Accent bar */}
            <div
              className={kanbanAccentBarClass}
              style={
                def.accent
                  ? { backgroundColor: 'var(--kanban-accent)' }
                  : { backgroundColor: 'transparent' }
              }
              aria-hidden="true"
            />

            {/* Note bar */}
            {def.note && <p className={kanbanNoteBarClass}>{def.note}</p>}

            {/* Cards */}
            <div className={kanbanColumnBodyClass}>
              {visible.map((card) => (
                <React.Fragment key={getCardKey(card)}>
                  {renderCard(card, def)}
                </React.Fragment>
              ))}

              {overflow > 0 && (
                <button
                  type="button"
                  className={kanbanOverflowButtonClass}
                  onClick={() => onShowMore?.(def.id)}
                >
                  {`+${overflow} more`}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
