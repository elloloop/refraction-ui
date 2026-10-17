import * as React from 'react'
import {
  createStepCard,
  getStepStatusMeta,
  resolveStepStatusLabel,
  shouldAnnounceStepStatus,
  shouldShowStepCardLiveHint,
  formatStepStatusAnnouncement,
  normalizeInstructionSteps,
  normalizeStepCardTroubleshooting,
  DEFAULT_STEP_STATUS,
  DEFAULT_STEP_CARD_TROUBLESHOOTING_TITLE,
  stepCardVariants,
  stepCardHeaderClass,
  stepCardIconClass,
  stepCardHeadingClass,
  stepCardTitleClass,
  stepCardReasonClass,
  stepCardBodyClass,
  stepCardLiveHintClass,
  stepStatusPillVariants,
  stepStatusIconVariants,
  stepCardTroubleshootingTriggerClass,
  stepCardTroubleshootingContentClass,
  stepCardTroubleshootingListClass,
  instructionListClass,
  instructionListTitleClass,
  instructionListItemsClass,
  instructionListItemClass,
  stepStatusIconPaths,
  stepCardChevronPath,
  STEP_CARD_ICON_VIEWBOX,
  type StepStatus,
} from '@refraction-ui/step-card'
import { MarkupText, type MarkupTextInlineMap } from '@refraction-ui/react-markup-text'
import { Button } from '@refraction-ui/react-button'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@refraction-ui/react-collapsible'
import { cn } from '@refraction-ui/shared'

/** Visually hidden but read by assistive technology. */
const SR_ONLY_CLASS = 'sr-only'
const ICON_STROKE_WIDTH = 2

function StrokeIcon({ paths, className }: { paths: readonly string[]; className?: string }) {
  return (
    <svg
      viewBox={STEP_CARD_ICON_VIEWBOX}
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// InstructionList
// ---------------------------------------------------------------------------

export interface InstructionListProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** Optional label above the list; it also names the list for screen readers. */
  title?: string
  /** Steps in order. Each is MarkupText: `**Open Settings**` bolds, `{token}` places an `inline` node. */
  steps: readonly string[]
  /** Nodes for `{token}` placeholders in the steps. */
  inline?: MarkupTextInlineMap
}

/**
 * InstructionList — a numbered list of steps in a muted well. Each step is
 * rendered through MarkupText so it can bold the words the user sees on
 * screen and place inline nodes (a keycap, an app icon).
 */
export const InstructionList = React.forwardRef<HTMLDivElement, InstructionListProps>(
  function InstructionList({ title, steps, inline, className, ...props }, ref) {
    const titleId = React.useId()
    const items = normalizeInstructionSteps(steps)
    const hasTitle = Boolean(title?.trim())
    if (items.length === 0) return null

    return (
      <div
        ref={ref}
        className={cn(instructionListClass, className)}
        data-slot="instruction-list"
        {...props}
      >
        {hasTitle && (
          <p id={titleId} className={instructionListTitleClass}>
            {title}
          </p>
        )}
        <ol className={instructionListItemsClass} aria-labelledby={hasTitle ? titleId : undefined}>
          {items.map((step, index) => (
            // Steps can repeat verbatim, so the position is part of the key.
            <li key={`${index}:${step}`} className={instructionListItemClass}>
              <MarkupText text={step} inline={inline} />
            </li>
          ))}
        </ol>
      </div>
    )
  },
)

// ---------------------------------------------------------------------------
// StepCard
// ---------------------------------------------------------------------------

export interface StepCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** Decorative icon for the step (e.g. a microphone glyph). */
  icon?: React.ReactNode
  /** Step name; also names the card and leads the status announcement. */
  title: string
  /** Why the app needs this step. */
  reason?: React.ReactNode
  /** Current status. Defaults to `'notDetermined'`. */
  status?: StepStatus
  /** Visible status text; defaults per status ("Not checked yet", "Needed", "Checking…", "Granted", "Failed"). */
  statusLabel?: string
  /** Label of the single action button. No label, no button. */
  actionLabel?: string
  /** Called when the action button is pressed. */
  onAction?: () => void
  /** Numbered instructions (MarkupText strings). */
  instructions?: readonly string[]
  /** Label above the instructions. */
  instructionsTitle?: string
  /** Troubleshooting tips (MarkupText), behind a disclosure. One string is one tip. */
  troubleshooting?: string | readonly string[]
  /** Disclosure label for the troubleshooting tips. Defaults to "Having trouble?". */
  troubleshootingTitle?: string
  /** Hint shown (and announced) while `status` is `'checking'`. */
  liveHint?: string
  /** Shows the instructions, action and troubleshooting. Defaults to `true`. */
  expanded?: boolean
  /** Nodes for `{token}` placeholders in instructions and troubleshooting. */
  inline?: MarkupTextInlineMap
}

function StepStatusPill({ status, label }: { status: StepStatus; label: string }) {
  const { tone, icon } = getStepStatusMeta(status)
  return (
    <span
      className={stepStatusPillVariants({ tone })}
      data-slot="step-card-status"
      data-status={status}
    >
      <StrokeIcon
        paths={stepStatusIconPaths[icon]}
        className={stepStatusIconVariants({ spinning: icon === 'spinner' ? 'true' : 'false' })}
      />
      {label}
    </span>
  )
}

/**
 * Text for the polite live region. Empty on first render; set only when
 * `status` changes so a page of cards stays quiet on load.
 */
function useStatusAnnouncement(
  title: string,
  status: StepStatus,
  statusLabel: string | undefined,
  liveHint: string | undefined,
): string {
  const [announcement, setAnnouncement] = React.useState('')
  const previous = React.useRef<StepStatus | undefined>(undefined)

  React.useEffect(() => {
    const before = previous.current
    previous.current = status
    if (!shouldAnnounceStepStatus(before, status)) return
    // Only a status change is news; a label or hint edit alone re-runs this
    // effect but is not announced.
    setAnnouncement(formatStepStatusAnnouncement({ title, status, statusLabel, liveHint }))
  }, [title, status, statusLabel, liveHint])

  return announcement
}

function StepCardTroubleshooting({
  title,
  tips,
  inline,
}: {
  title: string
  tips: string[]
  inline: MarkupTextInlineMap | undefined
}) {
  return (
    <Collapsible className="w-full">
      <CollapsibleTrigger className={stepCardTroubleshootingTriggerClass}>
        {title}
        <StrokeIcon paths={[stepCardChevronPath]} />
      </CollapsibleTrigger>
      <CollapsibleContent className={stepCardTroubleshootingContentClass} aria-label={title}>
        {tips.length === 1 ? (
          <p>
            <MarkupText text={tips[0]} inline={inline} />
          </p>
        ) : (
          <ul className={stepCardTroubleshootingListClass}>
            {tips.map((tip, index) => (
              <li key={`${index}:${tip}`}>
                <MarkupText text={tip} inline={inline} />
              </li>
            ))}
          </ul>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

/**
 * StepCard — one guided setup step (a permission to grant, a device to
 * connect) whose status updates live. Shows an icon, title, reason and a
 * status pill (icon + text, never colour alone); when `expanded`, numbered
 * instructions, one action and collapsible troubleshooting. Status changes
 * are announced through a polite live region, never on first render.
 */
export const StepCard = React.forwardRef<HTMLDivElement, StepCardProps>(function StepCard(
  {
    icon,
    title,
    reason,
    status = DEFAULT_STEP_STATUS,
    statusLabel,
    actionLabel,
    onAction,
    instructions,
    instructionsTitle,
    troubleshooting,
    troubleshootingTitle = DEFAULT_STEP_CARD_TROUBLESHOOTING_TITLE,
    liveHint,
    expanded = true,
    inline,
    className,
    ...props
  },
  ref,
) {
  const titleId = React.useId()
  const api = createStepCard({ status, expanded })
  const label = resolveStepStatusLabel(status, statusLabel)
  const announcement = useStatusAnnouncement(title, status, statusLabel, liveHint)
  const steps = normalizeInstructionSteps(instructions)
  const tips = normalizeStepCardTroubleshooting(troubleshooting)
  const showLiveHint = shouldShowStepCardLiveHint(status, liveHint)
  const hasAction = Boolean(actionLabel?.trim())
  const hasBody = expanded && (steps.length > 0 || hasAction || tips.length > 0)

  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={titleId}
      className={cn(stepCardVariants({ expanded: expanded ? 'true' : 'false' }), className)}
      data-slot="step-card"
      {...api.dataAttributes}
      {...props}
    >
      <div className={stepCardHeaderClass}>
        {icon != null && (
          <span className={stepCardIconClass} aria-hidden="true" data-slot="step-card-icon">
            {icon}
          </span>
        )}
        <div className={stepCardHeadingClass}>
          <h3 id={titleId} className={stepCardTitleClass}>
            {title}
          </h3>
          {reason != null && <p className={stepCardReasonClass}>{reason}</p>}
        </div>
        <StepStatusPill status={status} label={label} />
      </div>

      {showLiveHint && (
        <p className={stepCardLiveHintClass} data-slot="step-card-live-hint">
          {liveHint}
        </p>
      )}

      {hasBody && (
        <div className={stepCardBodyClass} data-slot="step-card-body">
          {steps.length > 0 && (
            <InstructionList title={instructionsTitle} steps={steps} inline={inline} />
          )}
          {hasAction && (
            <Button type="button" onClick={onAction} data-slot="step-card-action">
              {actionLabel}
            </Button>
          )}
          {tips.length > 0 && (
            <StepCardTroubleshooting title={troubleshootingTitle} tips={tips} inline={inline} />
          )}
        </div>
      )}

      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={SR_ONLY_CLASS}
        data-slot="step-card-announcer"
      >
        {announcement}
      </span>
    </div>
  )
})
