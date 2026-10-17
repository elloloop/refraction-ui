import * as React from 'react'
import {
  createListItem,
  createListItemGroup,
  getNextListItemIndex,
  getInitialListItemIndex,
  isListItemRovingKey,
  isListItemActivationKey,
  LIST_ITEM_DEFAULT_CONTEXT,
  LIST_ITEM_DEFAULT_DENSITY,
  listItemFocusRingClass,
  listItemGroupClass,
  listItemVariants,
  listItemContentVariants,
  listItemLeadingClass,
  listItemBodyClass,
  listItemTitleRowClass,
  listItemTitleVariants,
  listItemMetaVariants,
  listItemSubtitleVariants,
  listItemTrailingClass,
  listItemActionSlotClass,
  listItemActionButtonClass,
  type ListItemContext,
  type ListItemDensity,
} from '@refraction-ui/list-item'
import { cn } from '@refraction-ui/shared'

export type { ListItemContext, ListItemDensity }

/** Explains why an `action` passed to a listbox option is not rendered. */
const LISTBOX_ACTION_WARNING =
  '[refraction-ui] ListItem: `action` is not rendered in a listbox. Options have ' +
  'presentational children, so a nested button would be unreachable by assistive ' +
  'technology. Use context="navigation" for rows with a separate action.'

interface ListItemGroupContextValue {
  context: ListItemContext
  roving: boolean
  /** id of the option that owns the listbox's single tab stop (null until resolved). */
  activeId: string | null
  setActiveId: (id: string) => void
}

const ListItemGroupContext = React.createContext<ListItemGroupContextValue | null>(null)

/** Options are the group's direct `role="option"` children, in DOM order. */
function getOptions(list: HTMLElement): HTMLElement[] {
  return Array.from(list.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement && child.getAttribute('role') === 'option',
  )
}

function assignRef<T>(ref: React.ForwardedRef<T>, node: T | null) {
  if (typeof ref === 'function') ref(node)
  else if (ref) ref.current = node
}

export interface ListItemGroupProps extends React.HTMLAttributes<HTMLUListElement> {
  /**
   * What `selected` means for every row: `listbox` (`aria-selected`, roving
   * focus) or `navigation` (`aria-current`, normal Tab order). Required so the
   * semantics are always a deliberate choice.
   */
  context: ListItemContext
  /** Listbox only: more than one option may be selected (`aria-multiselectable`). */
  multiselectable?: boolean
}

/**
 * ListItemGroup — the `<ul>` that holds ListItems and tells them their context.
 *
 * In `listbox` context it is a `role="listbox"` with a single tab stop and
 * roving focus: ArrowDown / ArrowUp move between options (clamped at the
 * ends), Home / End jump to the first / last. Focus enters on the first
 * selected option. Give it an accessible name with `aria-label` or
 * `aria-labelledby`.
 *
 * In `navigation` context it is a plain `role="list"`; wrap it in
 * `<nav aria-label="…">` and every row's button stays in the Tab order.
 */
export const ListItemGroup = React.forwardRef<HTMLUListElement, ListItemGroupProps>(
  function ListItemGroup({ context, multiselectable, className, onKeyDown, children, ...props }, ref) {
    const api = createListItemGroup({ context, multiselectable })
    const listRef = React.useRef<HTMLUListElement | null>(null)
    const [activeId, setActiveId] = React.useState<string | null>(null)

    const setRefs = React.useCallback(
      (node: HTMLUListElement | null) => {
        listRef.current = node
        assignRef(ref, node)
      },
      [ref],
    )

    // Keep the tab stop on a row that still exists: on mount, and whenever the
    // active row is removed, fall back to the first selected (else first) row.
    React.useEffect(() => {
      const list = listRef.current
      if (!api.roving || !list) return
      const options = getOptions(list)
      if (activeId !== null && options.some((option) => option.id === activeId)) return
      const initial = getInitialListItemIndex(
        options.map((option) => option.getAttribute('aria-selected') === 'true'),
      )
      const nextId = initial === -1 ? null : options[initial].id
      if (nextId !== activeId) setActiveId(nextId)
    })

    const handleKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
      onKeyDown?.(event)
      const list = listRef.current
      if (event.defaultPrevented || !api.roving || !list) return
      if (event.altKey || event.ctrlKey || event.metaKey) return
      if (!isListItemRovingKey(event.key)) return

      const options = getOptions(list)
      const current = options.indexOf(event.target as HTMLElement)
      if (current === -1) return

      // Arrow keys belong to the listbox: never scroll the page, even when clamped.
      event.preventDefault()
      const next = getNextListItemIndex(current, event.key, options.length)
      if (next !== current) options[next].focus()
    }

    const contextValue = React.useMemo<ListItemGroupContextValue>(
      () => ({ context, roving: api.roving, activeId, setActiveId }),
      [context, api.roving, activeId],
    )

    return (
      <ListItemGroupContext.Provider value={contextValue}>
        <ul
          ref={setRefs}
          className={cn(listItemGroupClass, className)}
          {...api.ariaProps}
          {...api.dataAttributes}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {children}
        </ul>
      </ListItemGroupContext.Provider>
    )
  },
)

export interface ListItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, 'title'> {
  /** Primary line (a name). Truncates to one line with an ellipsis. */
  title: React.ReactNode
  /** Second line (a message preview). Truncates to one line with an ellipsis. */
  subtitle?: React.ReactNode
  /** Shown at the end of the title line (a time). Never truncated. */
  meta?: React.ReactNode
  /** Leading slot (an avatar). */
  leading?: React.ReactNode
  /** Trailing slot (a count, a check indicator). Must be non-interactive. */
  trailing?: React.ReactNode
  /**
   * A separate trailing control (e.g. a `ListItemAction`). Rendered as a
   * sibling of the row's button, never inside it. Navigation context only.
   */
  action?: React.ReactNode
  /** Selected / current row: `aria-selected` in a listbox, `aria-current` in navigation. */
  selected?: boolean
  /** Unread emphasis: bold title, subtitle and meta in full colour. */
  emphasized?: boolean
  /** Activates the row (click, Enter, Space). A navigation row without it is static. */
  onTap?: () => void
  /** Accessible name for the row's control, replacing its text content. */
  semanticLabel?: string
  /** Row padding. */
  density?: ListItemDensity
  /** Overrides the context inherited from `ListItemGroup` (default `navigation`). */
  context?: ListItemContext
}

interface ListItemContentProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  meta?: React.ReactNode
  leading?: React.ReactNode
  trailing?: React.ReactNode
  emphasized: boolean
}

function ListItemContent({ title, subtitle, meta, leading, trailing, emphasized }: ListItemContentProps) {
  const emphasis = emphasized ? 'true' : 'false'
  return (
    <>
      {leading != null && <span className={listItemLeadingClass}>{leading}</span>}
      <span className={listItemBodyClass}>
        <span className={listItemTitleRowClass}>
          <span className={listItemTitleVariants({ emphasized: emphasis })} data-slot="list-item-title">
            {title}
          </span>
          {meta != null && (
            <span className={listItemMetaVariants({ emphasized: emphasis })} data-slot="list-item-meta">
              {meta}
            </span>
          )}
        </span>
        {subtitle != null && (
          <span className={listItemSubtitleVariants({ emphasized: emphasis })} data-slot="list-item-subtitle">
            {subtitle}
          </span>
        )}
      </span>
      {trailing != null && (
        <span className={listItemTrailingClass} data-slot="list-item-trailing">
          {trailing}
        </span>
      )}
    </>
  )
}

/**
 * ListItem — a selectable row: leading slot, title with trailing meta, a
 * subtitle, a trailing slot and an optional separate action.
 *
 * Inside `<ListItemGroup context="listbox">` the `<li>` is a `role="option"`
 * (selected → `aria-selected`) that takes part in roving focus. In
 * `navigation` context the `<li>` holds a native `<button>` (selected →
 * `aria-current`) with the `action` as its sibling, so no interactive element
 * is ever nested inside another. The ref and extra props go to the `<li>`.
 */
export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(function ListItem(
  {
    title,
    subtitle,
    meta,
    leading,
    trailing,
    action,
    selected = false,
    emphasized = false,
    onTap,
    semanticLabel,
    density = LIST_ITEM_DEFAULT_DENSITY,
    context: contextProp,
    id: idProp,
    className,
    onClick,
    onKeyDown,
    onFocus,
    ...props
  },
  ref,
) {
  const group = React.useContext(ListItemGroupContext)
  const context = contextProp ?? group?.context ?? LIST_ITEM_DEFAULT_CONTEXT
  const generatedId = React.useId()
  const id = idProp ?? generatedId
  const api = createListItem({ context, selected, emphasized, density, interactive: onTap != null })
  const rowClassName = cn(listItemVariants({ selected: selected ? 'true' : 'false' }), className)
  const hasDroppedAction = action != null && !api.allowsAction

  React.useEffect(() => {
    if (hasDroppedAction) console.warn(LISTBOX_ACTION_WARNING)
  }, [hasDroppedAction])

  const content = (
    <ListItemContent
      title={title}
      subtitle={subtitle}
      meta={meta}
      leading={leading}
      trailing={trailing}
      emphasized={emphasized}
    />
  )

  if (api.rowIsControl) {
    const roving = group?.roving === true && context === 'listbox'
    // Before the group resolves its tab stop (SSR, first paint) the selected
    // option is the natural entry point.
    const tabbable = !roving || group.activeId === id || (group.activeId === null && selected)

    return (
      <li
        ref={ref}
        id={id}
        tabIndex={tabbable ? 0 : -1}
        aria-label={semanticLabel}
        className={cn(rowClassName, listItemFocusRingClass, 'cursor-pointer')}
        {...api.ariaProps}
        {...api.dataAttributes}
        onClick={(event) => {
          onClick?.(event)
          if (!event.defaultPrevented) onTap?.()
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented || !isListItemActivationKey(event.key)) return
          event.preventDefault()
          onTap?.()
        }}
        onFocus={(event) => {
          onFocus?.(event)
          if (roving) group.setActiveId(id)
        }}
        {...props}
      >
        <div className={listItemContentVariants({ density })}>{content}</div>
      </li>
    )
  }

  const rowAria = api.ariaTarget === 'row' ? api.ariaProps : {}
  const controlAria = api.ariaTarget === 'control' ? api.ariaProps : {}

  return (
    <li
      ref={ref}
      id={id}
      className={rowClassName}
      aria-label={api.rendersControl ? undefined : semanticLabel}
      {...rowAria}
      {...api.dataAttributes}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      {...props}
    >
      {api.rendersControl ? (
        <button
          type="button"
          aria-label={semanticLabel}
          className={listItemContentVariants({ density, interactive: 'true' })}
          onClick={onTap}
          {...controlAria}
        >
          {content}
        </button>
      ) : (
        <div className={listItemContentVariants({ density })}>{content}</div>
      )}
      {api.allowsAction && action != null && <div className={listItemActionSlotClass}>{action}</div>}
    </li>
  )
})

export interface ListItemActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: the action is icon-only, so it needs an accessible name. */
  'aria-label': string
}

/**
 * ListItemAction — an icon-only button for a ListItem's `action` slot, with a
 * 44 px hit area and the shared focus ring.
 */
export const ListItemAction = React.forwardRef<HTMLButtonElement, ListItemActionProps>(
  function ListItemAction({ className, type = 'button', ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(listItemActionButtonClass, className)}
        data-slot="list-item-action"
        {...props}
      />
    )
  },
)
