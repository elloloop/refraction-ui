export {
  PinnedBar,
  type PinnedBarProps,
  type PinnedBarItem,
  type PinnedBarLabels,
} from './pinned-bar.js'

// Headless helpers for consumers that keep `index` controlled and need the
// same "follow the pin across list changes" behaviour the uncontrolled bar has.
export {
  locatePinnedBarIndex,
  createPinnedBarAnchor,
  PINNED_BAR_DEFAULT_LABELS,
  type PinnedBarAnchor,
} from '@refraction-ui/pinned-bar'
