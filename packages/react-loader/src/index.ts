export {
  Spinner,
  type SpinnerProps,
  type LoaderVariant,
  type LoaderSize,
  type LoaderTone,
} from './spinner.js'

export {
  LoadingBar,
  PageLoadingBar,
  type LoadingBarProps,
  type PageLoadingBarProps,
  type LoadingBarPlacement,
} from './loading-bar.js'

export {
  LoadingOverlay,
  type LoadingOverlayProps,
  type LoadingOverlayScope,
} from './loading-overlay.js'

export { useDelayedLoading } from './use-delayed-loading.js'
export {
  useTrickleProgress,
  type TrickleProgressOptions,
  type TrickleProgressResult,
} from './use-trickle-progress.js'

export { LoaderStyleSheet, LOADER_STYLE_HREF } from './loader-style-sheet.js'

// Re-export headless helpers for consumers who need the pure logic.
export {
  createLoader,
  createLoadingBar,
  createLoadingOverlay,
  reduceLoaderVisibility,
  initialLoaderVisibility,
  isLoaderVisible,
  nextLoaderTransitionAt,
  trickleProgress,
  clampProgress,
  pickLoaderMessage,
  spinnerVariants,
  loadingBarVariants,
  loadingOverlayVariants,
  loaderStyles,
  type LoaderTimingOptions,
  type LoaderVisibilityState,
  type LoaderVisibilityEvent,
} from '@refraction-ui/loader'
