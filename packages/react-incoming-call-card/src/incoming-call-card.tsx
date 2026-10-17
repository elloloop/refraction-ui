import * as React from 'react'
import {
  createIncomingCallCard,
  getIncomingCallCardIds,
  getIncomingCallEscapeAction,
  resolveIncomingCallCountdown,
  tickIncomingCallCountdown,
  defaultIncomingCallCountdownLabel,
  INCOMING_CALL_KIND_LABELS,
  incomingCallCardVariants,
  incomingCallCardAvatarRingVariants,
  incomingCallCardRingPulseClass,
  incomingCallCardTitleVariants,
  incomingCallCardDescriptionClass,
  incomingCallCardKindClass,
  incomingCallCardContextClass,
  incomingCallCardCountdownClass,
  incomingCallCardCountdownTextClass,
  incomingCallCardCountdownTrackClass,
  incomingCallCardCountdownBarClass,
  incomingCallCardActionsClass,
  incomingCallCardActionVariants,
  incomingCallCardIconClass,
  type IncomingCallCountdown,
  type IncomingCallKind,
  type IncomingCallEscapeBehavior,
  type IncomingCallLayout,
} from '@refraction-ui/incoming-call-card'
import { Avatar, AvatarImage, AvatarFallback, getInitials } from '@refraction-ui/react-avatar'
import { cn } from '@refraction-ui/shared'

export type { IncomingCallKind, IncomingCallEscapeBehavior, IncomingCallLayout }

/** One countdown step, in milliseconds (the core counts whole seconds). */
const COUNTDOWN_TICK_MS = 1000
const PERCENT = 100
const AVATAR_SIZE = 'xl'

export interface IncomingCallCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role' | 'title'> {
  /** The caller's name — the dialog's accessible name. */
  callerName: string
  /** Caller's avatar image; initials from `callerName` are the fallback. */
  avatarSrc?: string
  /** Audio or video call. Picks the kind label and the Accept icon. */
  kind?: IncomingCallKind
  /** Overrides the "Incoming audio/video call" description (e.g. for i18n). */
  kindLabel?: string
  /** Optional context, e.g. the meeting, channel or team the call is from. */
  context?: React.ReactNode
  /** Called when the user answers. */
  onAccept: () => void
  /** Called when the user rejects the call (and on timeout without `onTimeout`). */
  onDecline: () => void
  /** Called when Esc dismisses the card (`escapeBehavior="dismiss"`). */
  onDismiss?: () => void
  /** Called once when the countdown reaches zero. Defaults to `onDecline`. */
  onTimeout?: () => void
  /** Accept button text. */
  acceptLabel?: string
  /** Decline button text. */
  declineLabel?: string
  /** Length of the ring in seconds. Omit for no countdown. */
  timeoutSeconds?: number
  /**
   * Seconds left, when the app drives the countdown itself (controlled). When
   * omitted and `timeoutSeconds` is set, the card counts down on its own.
   */
  remaining?: number
  /** Visible countdown text for the seconds left. */
  countdownLabel?: (remainingSeconds: number) => string
  /** What Esc does: nothing, decline, or dismiss. */
  escapeBehavior?: IncomingCallEscapeBehavior
  /** Floating overlay, or the whole content of a small separate window. */
  layout?: IncomingCallLayout
  /** Move focus to the card on mount (and back on unmount). */
  autoFocus?: boolean
}

/** Keep the newest callback without re-running effects when its identity changes. */
function useLatest<T>(value: T): React.MutableRefObject<T> {
  const ref = React.useRef(value)
  ref.current = value
  return ref
}

/**
 * Countdown state: controlled by `remaining`, or ticked here once a second
 * from `timeoutSeconds`. The core only resolves and steps values; the clock
 * lives in the adapter (or in the app), so the core stays deterministic.
 */
function useIncomingCallCountdown(
  timeoutSeconds: number | undefined,
  remaining: number | undefined,
  onExpire: () => void,
): IncomingCallCountdown | null {
  const isControlled = remaining !== undefined
  const [internal, setInternal] = React.useState(timeoutSeconds)

  React.useEffect(() => {
    setInternal(timeoutSeconds)
  }, [timeoutSeconds])

  const countdown = resolveIncomingCallCountdown({
    timeoutSeconds,
    remaining: isControlled ? remaining : internal,
  })
  const expired = countdown?.expired ?? false
  const running = countdown !== null && !expired && !isControlled

  // One interval for the whole ring (not a timeout per render), so ticks never
  // wait on React to re-render and the countdown does not drift.
  React.useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setInternal((left) => tickIncomingCallCountdown(left ?? 0))
    }, COUNTDOWN_TICK_MS)
    return () => clearInterval(id)
  }, [running])

  const expireRef = useLatest(onExpire)
  const firedRef = React.useRef(false)
  React.useEffect(() => {
    if (!expired) {
      firedRef.current = false
      return
    }
    if (firedRef.current) return
    firedRef.current = true
    expireRef.current()
  }, [expired, expireRef])

  return countdown
}

/**
 * Focus the card on mount so the alertdialog is announced, and hand focus
 * back to wherever the user was when the card goes away. Focus lands on the
 * container, never on Accept, so a stray Enter cannot answer the call.
 */
function useCardFocus(node: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  React.useEffect(() => {
    const card = node.current
    if (!enabled || !card) return
    const previous = document.activeElement
    card.focus()
    return () => {
      const active = document.activeElement
      const focusIsLost = active === null || active === document.body || card.contains(active)
      if (focusIsLost && previous instanceof HTMLElement && previous.isConnected) {
        previous.focus()
      }
    }
  }, [node, enabled])
}

const ICON_VIEWBOX = '0 0 24 24'
const ICON_STROKE_WIDTH = 2
/** Rotating the handset turns "phone" into the universal "hang up" glyph. */
const HANG_UP_ROTATION = 'rotate(135 12 12)'
const PHONE_PATH =
  'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'

function Icon({ children, name }: { children: React.ReactNode; name: string }) {
  return (
    <svg
      className={incomingCallCardIconClass}
      viewBox={ICON_VIEWBOX}
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-icon={name}
    >
      {children}
    </svg>
  )
}

function PhoneIcon() {
  return (
    <Icon name="phone">
      <path d={PHONE_PATH} />
    </Icon>
  )
}

function HangUpIcon() {
  return (
    <Icon name="hang-up">
      <g transform={HANG_UP_ROTATION}>
        <path d={PHONE_PATH} />
      </g>
    </Icon>
  )
}

function VideoIcon() {
  return (
    <Icon name="video">
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </Icon>
  )
}

function KindIcon({ kind }: { kind: IncomingCallKind }) {
  return kind === 'video' ? <VideoIcon /> : <PhoneIcon />
}

/**
 * IncomingCallCard — a ringing call with Accept and Decline.
 *
 * An `alertdialog` named by the caller and described by the call kind and
 * context. On mount it focuses itself (not Accept) so it is announced and a
 * stray Enter does nothing; Esc does what `escapeBehavior` says; an outside
 * click never dismisses it. An optional countdown fires `onTimeout` (or
 * `onDecline`) once when it runs out. The ring is CSS-only and static under
 * `prefers-reduced-motion`; the component plays no audio.
 */
export const IncomingCallCard = React.forwardRef<HTMLDivElement, IncomingCallCardProps>(
  function IncomingCallCard(
    {
      callerName,
      avatarSrc,
      kind = 'audio',
      kindLabel,
      context,
      onAccept,
      onDecline,
      onDismiss,
      onTimeout,
      acceptLabel = 'Accept',
      declineLabel = 'Decline',
      timeoutSeconds,
      remaining,
      countdownLabel = defaultIncomingCallCountdownLabel,
      escapeBehavior = 'none',
      layout = 'overlay',
      autoFocus = true,
      className,
      onKeyDown,
      ...props
    },
    ref,
  ) {
    const cardRef = React.useRef<HTMLDivElement | null>(null)
    React.useImperativeHandle(ref, () => cardRef.current as HTMLDivElement)
    useCardFocus(cardRef, autoFocus)

    const callbacks = useLatest({ onDecline, onTimeout })
    const handleExpire = React.useCallback(() => {
      const { onTimeout: timeout, onDecline: decline } = callbacks.current
      ;(timeout ?? decline)()
    }, [callbacks])
    const countdown = useIncomingCallCountdown(timeoutSeconds, remaining, handleExpire)
    const ringing = !(countdown?.expired ?? false)

    const { titleId, descriptionId } = getIncomingCallCardIds(React.useId())
    const api = createIncomingCallCard({ titleId, descriptionId, kind, layout, ringing })

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented) return
      const action = getIncomingCallEscapeAction(event.key, escapeBehavior)
      if (action === null) return
      event.preventDefault()
      event.stopPropagation()
      if (action === 'decline') onDecline()
      else onDismiss?.()
    }

    return (
      <div
        ref={cardRef}
        tabIndex={-1}
        className={cn(incomingCallCardVariants({ layout }), className)}
        {...api.ariaProps}
        {...api.dataAttributes}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <span
          className={incomingCallCardAvatarRingVariants({ ringing: ringing ? 'true' : 'false' })}
          aria-hidden="true"
        >
          {ringing && <span className={incomingCallCardRingPulseClass} data-slot="ring-pulse" />}
          <Avatar size={AVATAR_SIZE}>
            {avatarSrc && <AvatarImage src={avatarSrc} alt="" />}
            <AvatarFallback>{getInitials(callerName)}</AvatarFallback>
          </Avatar>
        </span>

        <h2 id={titleId} className={incomingCallCardTitleVariants({ layout })}>
          {callerName}
        </h2>

        <div id={descriptionId} className={incomingCallCardDescriptionClass}>
          <span className={incomingCallCardKindClass}>
            <KindIcon kind={kind} />
            <span>{kindLabel ?? INCOMING_CALL_KIND_LABELS[kind]}</span>
          </span>
          {context != null && <span className={incomingCallCardContextClass}>{context}</span>}
        </div>

        {countdown && (
          <div className={incomingCallCardCountdownClass} data-slot="countdown">
            <span role="timer" className={incomingCallCardCountdownTextClass}>
              {countdownLabel(countdown.remaining)}
            </span>
            {countdown.fraction !== null && (
              <div className={incomingCallCardCountdownTrackClass} aria-hidden="true">
                <div
                  className={incomingCallCardCountdownBarClass}
                  style={{ width: `${countdown.fraction * PERCENT}%` }}
                />
              </div>
            )}
          </div>
        )}

        <div className={incomingCallCardActionsClass}>
          <button
            type="button"
            className={incomingCallCardActionVariants({ action: 'decline' })}
            data-action="decline"
            onClick={onDecline}
          >
            <HangUpIcon />
            <span>{declineLabel}</span>
          </button>
          <button
            type="button"
            className={incomingCallCardActionVariants({ action: 'accept' })}
            data-action="accept"
            onClick={onAccept}
          >
            <KindIcon kind={kind} />
            <span>{acceptLabel}</span>
          </button>
        </div>
      </div>
    )
  },
)
