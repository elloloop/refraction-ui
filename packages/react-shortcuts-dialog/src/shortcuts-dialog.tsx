import * as React from 'react'
import {
  collectShortcutsDialogShortcuts,
  createShortcutsDialog,
  formatShortcutsDialogRowKeysLabel,
  isShortcutsDialogOpenEvent,
  isShortcutsDialogTypingTarget,
  shortcutsDialogAlternativeClass,
  shortcutsDialogCloseVariants,
  shortcutsDialogComboClass,
  shortcutsDialogCombosClass,
  shortcutsDialogContentClass,
  shortcutsDialogDescriptionClass,
  shortcutsDialogEmptyClass,
  shortcutsDialogGroupHeadingClass,
  shortcutsDialogHeaderClass,
  shortcutsDialogListClass,
  shortcutsDialogRowClass,
  shortcutsDialogRowsClass,
  shortcutsDialogSearchClass,
  shortcutsDialogSectionClass,
  SHORTCUTS_DIALOG_DEFAULT_LABELS,
  type ShortcutsDialogLabels,
  type ShortcutsDialogRegistrySource,
  type ShortcutsDialogRow,
  type ShortcutsDialogShortcut,
} from '@refraction-ui/shortcuts-dialog'
import { globalShortcutRegistry, type RegisteredShortcut } from '@refraction-ui/keyboard-shortcut'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@refraction-ui/react-dialog'
import {
  Keycap,
  detectKeycapPlatform,
  DEFAULT_KEYCAP_PLATFORM,
  type KeycapPlatform,
} from '@refraction-ui/react-keycap'
import { cn } from '@refraction-ui/shared'

const SR_ONLY_CLASS = 'sr-only'
const CLOSE_ICON_PATH = 'M18 6 6 18M6 6l12 12'
const CLOSE_ICON_SIZE = 20
const NO_REGISTERED_SHORTCUTS: readonly RegisteredShortcut[] = []
/** Stable default, so the listing is not recomputed on every render. */
const NO_EXTRA_SHORTCUTS: ShortcutsDialogShortcut[] = []

export interface ShortcutsDialogProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Controlled open state. */
  open?: boolean
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean
  /** Called when the dialog opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** Shortcuts listed besides the registered ones (e.g. handled outside `useShortcut`). */
  shortcuts?: ShortcutsDialogShortcut[]
  /** Also list every `SANE_DEFAULTS` action, registered or not. */
  includeDefaults?: boolean
  /** Where registered shortcuts come from. Defaults to `globalShortcutRegistry`, which `useShortcut` fills. */
  registry?: ShortcutsDialogRegistrySource
  /** Listen for ⌘/ (Ctrl+/ off macOS) and `?` to open, and list them. */
  openShortcut?: boolean
  /** Key legends to print; detected when omitted. Inject for SSR and tests. */
  platform?: KeycapPlatform
  /** Groups listed first, in this order; the rest follow alphabetically. */
  groupOrder?: string[]
  /** Visible and spoken strings, for localisation. */
  labels?: Partial<ShortcutsDialogLabels>
  /** Element that opens the dialog on click (rendered as the DialogTrigger child). */
  trigger?: React.ReactElement
}

/** The platform never changes during a session, so there is nothing to subscribe to. */
function subscribeToNothing(): () => void {
  return () => {}
}

function serverPlatform(): KeycapPlatform {
  return DEFAULT_KEYCAP_PLATFORM
}

/** Injected platform, else detected — the server default until hydration, matching Keycap. */
function useShortcutsDialogPlatform(platform?: KeycapPlatform): KeycapPlatform {
  const detected = React.useSyncExternalStore(subscribeToNothing, detectKeycapPlatform, serverPlatform)
  return platform ?? detected
}

function serverRegistrySnapshot(): readonly RegisteredShortcut[] {
  return NO_REGISTERED_SHORTCUTS
}

/**
 * Live registry entries. The server render and hydration use the registry's
 * server snapshot — none by default, since `useShortcut` registers in effects.
 */
function useRegisteredShortcuts(registry: ShortcutsDialogRegistrySource): readonly RegisteredShortcut[] {
  return React.useSyncExternalStore(
    registry.subscribe,
    registry.getSnapshot,
    registry.getServerSnapshot ?? serverRegistrySnapshot,
  )
}

function useOpenState(
  controlledOpen: boolean | undefined,
  defaultOpen: boolean,
  onOpenChange: ((open: boolean) => void) | undefined,
): [boolean, (open: boolean) => void] {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )
  return [isControlled ? controlledOpen : uncontrolledOpen, setOpen]
}

/** Opens on ⌘/ / Ctrl+/ and `?`, unless the key is being typed into a text field. */
function useOpenShortcut(enabled: boolean, platform: KeycapPlatform, onOpen: () => void): void {
  React.useEffect(() => {
    if (!enabled) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isShortcutsDialogOpenEvent(event, platform)) return
      if (isShortcutsDialogTypingTarget(event.target)) return
      event.preventDefault()
      onOpen()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enabled, platform, onOpen])
}

function CloseGlyph() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={CLOSE_ICON_SIZE}
      height={CLOSE_ICON_SIZE}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={CLOSE_ICON_PATH} />
    </svg>
  )
}

interface RowProps {
  row: ShortcutsDialogRow
  platform: KeycapPlatform
  alternative: string
}

/** One shortcut: its keys are read as one phrase ("Command + / or ?"); the keycaps are decorative. */
function ShortcutsDialogRowItem({ row, platform, alternative }: RowProps) {
  return (
    <li className={shortcutsDialogRowClass} data-shortcut-row="">
      <span className={shortcutsDialogDescriptionClass}>{row.description}</span>
      <span className={shortcutsDialogCombosClass}>
        <span className={SR_ONLY_CLASS}>{formatShortcutsDialogRowKeysLabel(row, alternative)}</span>
        <span aria-hidden="true" className={shortcutsDialogCombosClass}>
          {row.combos.map((combo, index) => (
            <React.Fragment key={combo.id}>
              {index > 0 && <span className={shortcutsDialogAlternativeClass}>{alternative}</span>}
              <span className={shortcutsDialogComboClass} data-combo={combo.id}>
                {combo.parts.map((part) => (
                  <Keycap key={part.key} legend={part.key} platform={platform} size="sm" />
                ))}
              </span>
            </React.Fragment>
          ))}
        </span>
      </span>
    </li>
  )
}

interface BodyProps {
  labels: ShortcutsDialogLabels
  shortcuts: ShortcutsDialogShortcut[]
  includeDefaults: boolean
  registry: ShortcutsDialogRegistrySource
  openShortcut: boolean
  platform: KeycapPlatform
  groupOrder?: string[]
}

/**
 * Search field and list. Mounted only while the dialog is open, so the search
 * resets on every open and the registry is only watched while it is shown.
 */
function ShortcutsDialogBody({
  labels,
  shortcuts,
  includeDefaults,
  registry,
  openShortcut,
  platform,
  groupOrder,
}: BodyProps) {
  const [query, setQuery] = React.useState('')
  const registered = useRegisteredShortcuts(registry)
  const baseId = React.useId()
  const listId = `${baseId}-list`

  const api = React.useMemo(
    () =>
      createShortcutsDialog({
        shortcuts: collectShortcutsDialogShortcuts({
          registered,
          shortcuts,
          openShortcutDescription: openShortcut ? labels.openShortcut : undefined,
          includeDefaults,
        }),
        platform,
        query,
        groupOrder,
      }),
    [registered, shortcuts, openShortcut, labels.openShortcut, includeDefaults, platform, query, groupOrder],
  )

  return (
    <>
      <input
        type="search"
        className={shortcutsDialogSearchClass}
        aria-label={labels.searchLabel}
        aria-controls={listId}
        placeholder={labels.searchPlaceholder}
        autoComplete="off"
        spellCheck={false}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <p role="status" aria-live="polite" className={SR_ONLY_CLASS}>
        {labels.resultCount(api.matchCount)}
      </p>
      <div id={listId} className={shortcutsDialogListClass}>
        {api.isEmpty ? (
          <p className={shortcutsDialogEmptyClass}>{labels.empty}</p>
        ) : (
          api.sections.map((section, index) => {
            const headingId = `${baseId}-group-${index}`
            return (
              <section key={section.group} aria-labelledby={headingId} className={shortcutsDialogSectionClass}>
                <h3 id={headingId} className={shortcutsDialogGroupHeadingClass}>
                  {section.group}
                </h3>
                <ul role="list" className={shortcutsDialogRowsClass}>
                  {section.rows.map((row) => (
                    <ShortcutsDialogRowItem
                      key={row.id}
                      row={row}
                      platform={platform}
                      alternative={labels.alternative}
                    />
                  ))}
                </ul>
              </section>
            )
          })
        )}
      </div>
    </>
  )
}

/**
 * ShortcutsDialog — keyboard shortcut help generated from the shortcut
 * registry. Lists every shortcut registered through `useShortcut` with a
 * description (plus `shortcuts` and, optionally, `SANE_DEFAULTS`), grouped and
 * searchable, with platform-aware Keycaps. Opens on ⌘/ / Ctrl+/ and `?`; Esc
 * closes and focus returns to where it was (Dialog's focus trap).
 */
export const ShortcutsDialog = React.forwardRef<HTMLDivElement, ShortcutsDialogProps>(
  function ShortcutsDialog(
    {
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      shortcuts = NO_EXTRA_SHORTCUTS,
      includeDefaults = false,
      registry = globalShortcutRegistry,
      openShortcut = true,
      platform: platformProp,
      groupOrder,
      labels: labelsProp,
      trigger,
      className,
      ...props
    },
    ref,
  ) {
    const [open, setOpen] = useOpenState(openProp, defaultOpen, onOpenChange)
    const platform = useShortcutsDialogPlatform(platformProp)
    const labels = React.useMemo(() => ({ ...SHORTCUTS_DIALOG_DEFAULT_LABELS, ...labelsProp }), [labelsProp])
    const show = React.useCallback(() => setOpen(true), [setOpen])
    useOpenShortcut(openShortcut, platform, show)

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogOverlay />
        <DialogContent
          ref={ref}
          className={cn(shortcutsDialogContentClass, className)}
          data-platform={platform}
          {...props}
        >
          {/* Title and description are direct children so the dialog is named in the very first (and server) render. */}
          <DialogHeader className={shortcutsDialogHeaderClass}>
            <DialogTitle>{labels.title}</DialogTitle>
            <DialogDescription>{labels.description}</DialogDescription>
          </DialogHeader>
          <ShortcutsDialogBody
            labels={labels}
            shortcuts={shortcuts}
            includeDefaults={includeDefaults}
            registry={registry}
            openShortcut={openShortcut}
            platform={platform}
            groupOrder={groupOrder}
          />
          <DialogClose className={shortcutsDialogCloseVariants()} aria-label={labels.close}>
            <CloseGlyph />
          </DialogClose>
        </DialogContent>
      </Dialog>
    )
  },
)
