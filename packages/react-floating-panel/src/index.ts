export {
  FloatingPanel,
  type FloatingPanelProps,
  type FloatingPanelCorner,
} from './floating-panel.js'

// Re-export headless helpers for consumers persisting or computing positions.
export {
  getNearestFloatingPanelCorner,
  getFloatingPanelCornerPosition,
  clampFloatingPanelPosition,
  getNextFloatingPanelCorner,
  isFloatingPanelCorner,
  floatingPanelVariants,
  FLOATING_PANEL_CORNERS,
  FLOATING_PANEL_DEFAULT_CORNER,
  FLOATING_PANEL_DEFAULT_MARGIN_PX,
  type FloatingPanelLayout,
  type FloatingPanelPoint,
  type FloatingPanelSize,
} from '@refraction-ui/floating-panel'
