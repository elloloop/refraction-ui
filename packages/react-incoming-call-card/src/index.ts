export {
  IncomingCallCard,
  type IncomingCallCardProps,
  type IncomingCallKind,
  type IncomingCallEscapeBehavior,
  type IncomingCallLayout,
} from './incoming-call-card.js'

// Re-export headless helpers and styles for consumers composing their own UI.
export {
  createIncomingCallCard,
  getIncomingCallCardIds,
  getIncomingCallEscapeAction,
  resolveIncomingCallCountdown,
  tickIncomingCallCountdown,
  formatIncomingCallCountdown,
  defaultIncomingCallCountdownLabel,
  INCOMING_CALL_KIND_LABELS,
  incomingCallCardVariants,
  incomingCallCardActionVariants,
  type IncomingCallCountdown,
  type IncomingCallEscapeAction,
  type IncomingCallCardAPI,
} from '@refraction-ui/incoming-call-card'
