/**
 * Status of one setup step (Flutter `RefractionStepStatus`).
 *
 * - `notDetermined` — the app has not read the permission yet
 * - `needed` — the user still has to act
 * - `checking` — the app is waiting to see the change land
 * - `granted` — done
 * - `failed` — the check failed or the permission was refused
 */
export type StepStatus = 'notDetermined' | 'needed' | 'checking' | 'granted' | 'failed'

/** Every status, in the order a step normally moves through them. */
export const STEP_STATUSES: readonly StepStatus[] = [
  'notDetermined',
  'needed',
  'checking',
  'granted',
  'failed',
]

/** Semantic colour role of a status. Colour is always paired with an icon and text. */
export type StepStatusTone = 'neutral' | 'attention' | 'progress' | 'success' | 'danger'

/** Shape drawn next to the status label, so the status never relies on colour. */
export type StepStatusIcon = 'pending' | 'alert' | 'spinner' | 'check' | 'cross'

export interface StepStatusMeta {
  tone: StepStatusTone
  icon: StepStatusIcon
  /** Label shown when the caller passes no `statusLabel`. */
  defaultLabel: string
}

const STEP_STATUS_META: Readonly<Record<StepStatus, StepStatusMeta>> = {
  notDetermined: { tone: 'neutral', icon: 'pending', defaultLabel: 'Not checked yet' },
  needed: { tone: 'attention', icon: 'alert', defaultLabel: 'Needed' },
  checking: { tone: 'progress', icon: 'spinner', defaultLabel: 'Checking…' },
  granted: { tone: 'success', icon: 'check', defaultLabel: 'Granted' },
  failed: { tone: 'danger', icon: 'cross', defaultLabel: 'Failed' },
}

/** Status used when none is given: nothing has been read yet. */
export const DEFAULT_STEP_STATUS: StepStatus = 'notDetermined'

/** Default disclosure label for the troubleshooting section. */
export const DEFAULT_STEP_CARD_TROUBLESHOOTING_TITLE = 'Having trouble?'

/** Narrow an unknown value (e.g. from a CMS or a query string) to a status. */
export function isStepStatus(value: unknown): value is StepStatus {
  return typeof value === 'string' && (STEP_STATUSES as readonly string[]).includes(value)
}

/** Tone, icon and default label for a status. */
export function getStepStatusMeta(status: StepStatus): StepStatusMeta {
  return STEP_STATUS_META[status]
}

/** The visible status text: the caller's `statusLabel`, or the status default. */
export function resolveStepStatusLabel(status: StepStatus, statusLabel?: string): string {
  const custom = statusLabel?.trim()
  return custom ? custom : STEP_STATUS_META[status].defaultLabel
}

/**
 * Whether a status change should be announced. The first render (`previous`
 * undefined) is never announced: a page full of cards would otherwise read
 * every status aloud on load. Only a real change is.
 */
export function shouldAnnounceStepStatus(
  previous: StepStatus | undefined,
  next: StepStatus,
): boolean {
  return previous !== undefined && previous !== next
}

/** The live hint is shown only while the step is checking and a hint exists. */
export function shouldShowStepCardLiveHint(status: StepStatus, liveHint?: string): boolean {
  return status === 'checking' && Boolean(liveHint?.trim())
}

/**
 * Sentence the polite live region reads when a status changes, e.g.
 * "Microphone: Checking…. Toggle Refraction on in System Settings.".
 * The live hint rides along only while checking, so the user hears what to do.
 */
export function formatStepStatusAnnouncement(options: {
  title: string
  status: StepStatus
  statusLabel?: string
  liveHint?: string
}): string {
  const { title, status, statusLabel, liveHint } = options
  const label = resolveStepStatusLabel(status, statusLabel)
  const name = title.trim()
  const head = name ? `${name}: ${label}` : label
  if (!shouldShowStepCardLiveHint(status, liveHint)) return head
  return `${head}. ${liveHint?.trim()}`
}

/** Instruction steps without blank entries (a blank step would render an empty number). */
export function normalizeInstructionSteps(steps: readonly string[] | undefined): string[] {
  if (!steps) return []
  return steps.filter((step) => step.trim().length > 0)
}

/**
 * Troubleshooting tips as a list. A single string is one tip; blank tips are
 * dropped. An empty result means the troubleshooting section is not rendered.
 */
export function normalizeStepCardTroubleshooting(
  troubleshooting: string | readonly string[] | undefined,
): string[] {
  if (troubleshooting === undefined) return []
  const tips = typeof troubleshooting === 'string' ? [troubleshooting] : troubleshooting
  return tips.filter((tip) => tip.trim().length > 0)
}

export interface StepCardOptions {
  status?: StepStatus
  /** Whether the card body (instructions, action, troubleshooting) is shown. */
  expanded?: boolean
}

export interface StepCardAPI {
  status: StepStatus
  tone: StepStatusTone
  icon: StepStatusIcon
  /** Data attributes for styling hooks on the card root. */
  dataAttributes: Record<string, string>
}

/**
 * Framework-agnostic state for a StepCard: the resolved status, its tone and
 * icon, and data attributes adapters spread on the root.
 */
export function createStepCard(options: StepCardOptions = {}): StepCardAPI {
  const status = options.status ?? DEFAULT_STEP_STATUS
  const expanded = options.expanded ?? true
  const { tone, icon } = STEP_STATUS_META[status]
  return {
    status,
    tone,
    icon,
    dataAttributes: {
      'data-status': status,
      'data-tone': tone,
      'data-expanded': expanded ? 'true' : 'false',
    },
  }
}
