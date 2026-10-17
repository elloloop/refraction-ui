/**
 * A person who replied in the thread. Avatars are passed as data (not
 * elements) so every adapter renders them the same way: decorative, at one
 * size, stacked, and capped to {@link THREAD_SUMMARY_DEFAULT_MAX_AVATARS}.
 */
export interface ThreadSummaryAvatar {
  /** Stable identifier, used as the render key. */
  id: string
  /** Display name. Drives the initials fallback when there is no image. */
  name: string
  /** Optional image URL. */
  src?: string
}

/**
 * Default number of replier avatars shown before the stack is capped. Three
 * reads as "a few people" without pushing the label off a narrow row; the
 * reply count lives in the label, so the cap never hides information.
 */
export const THREAD_SUMMARY_DEFAULT_MAX_AVATARS = 3

/** Separator between `label` and `detail` in the derived accessible name. */
export const THREAD_SUMMARY_NAME_SEPARATOR = ', '

export interface ThreadSummaryProps {
  /** Visible summary, e.g. "12 replies". */
  label: string
  /** Secondary text, e.g. "Last reply 2 h ago". */
  detail?: string
  /** Accessible name override. Defaults to `label` + `detail`. */
  semanticLabel?: string
  /** Total number of replier avatars supplied (before capping). */
  avatarCount?: number
}

export interface ThreadSummaryAPI {
  /** ARIA attributes to spread on the single control (the whole line). */
  ariaProps: Record<string, string | number | boolean>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
  /** The resolved accessible name (also the `aria-label`). */
  accessibleName: string
}

function nonEmpty(text: string | undefined): string | undefined {
  const trimmed = text?.trim()
  return trimmed ? trimmed : undefined
}

/**
 * Resolve the accessible name of the summary line. An explicit, non-blank
 * `semanticLabel` wins; otherwise the visible `label` and `detail` are joined
 * so a screen reader hears exactly what a sighted user reads. Blank parts are
 * dropped so no dangling separator is announced.
 */
export function getThreadSummaryAccessibleName({
  label,
  detail,
  semanticLabel,
}: Pick<ThreadSummaryProps, 'label' | 'detail' | 'semanticLabel'>): string {
  const override = nonEmpty(semanticLabel)
  if (override) return override

  return [nonEmpty(label), nonEmpty(detail)]
    .filter((part): part is string => part !== undefined)
    .join(THREAD_SUMMARY_NAME_SEPARATOR)
}

/**
 * Normalise a caller-supplied avatar cap. Negative values clamp to 0 (show
 * no avatars), fractions floor, and non-finite input falls back to the
 * default so a bad prop never renders an unbounded stack.
 */
export function resolveThreadSummaryMaxAvatars(max: number | undefined): number {
  if (max === undefined || !Number.isFinite(max)) {
    return THREAD_SUMMARY_DEFAULT_MAX_AVATARS
  }
  return Math.max(0, Math.floor(max))
}

/** The avatars actually rendered: the first `max` (normalised) repliers. */
export function getThreadSummaryVisibleAvatars<T>(
  avatars: readonly T[] | undefined,
  max?: number,
): T[] {
  if (!avatars) return []
  return avatars.slice(0, resolveThreadSummaryMaxAvatars(max))
}

/**
 * Build the framework-agnostic props for a thread summary line.
 *
 * The whole line is one control that opens the thread, so the core only
 * produces the control's accessible name and styling hooks; avatars are
 * decorative and hidden from assistive technology by the adapter.
 */
export function createThreadSummary(props: ThreadSummaryProps): ThreadSummaryAPI {
  const { detail, avatarCount = 0 } = props
  const accessibleName = getThreadSummaryAccessibleName(props)

  const ariaProps: Record<string, string | number | boolean> = {}
  if (accessibleName) ariaProps['aria-label'] = accessibleName

  const dataAttributes: Record<string, string> = {
    'data-slot': 'thread-summary',
    'data-has-detail': nonEmpty(detail) ? 'true' : 'false',
    'data-avatar-count': String(Math.max(0, avatarCount)),
  }

  return { ariaProps, dataAttributes, accessibleName }
}
