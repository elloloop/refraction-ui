export {
  VirtualList,
  type VirtualListProps,
  type VirtualListHandle,
  type VirtualListScrollToOptions,
  type VirtualListScrollToEndOptions,
} from './virtual-list.js'

// Re-export the headless maths so composed components (e.g. JumpToLatest) and
// custom scrollers share one definition of "at the end".
export {
  isVirtualListAtEnd,
  getVirtualListDistanceFromEnd,
  VIRTUAL_LIST_DEFAULT_AT_END_THRESHOLD,
  type VirtualListAlign,
  type VirtualListAnchor,
  type VirtualListKey,
  type VirtualListRange,
  type VirtualListRole,
  type VirtualListScrollBehavior,
} from '@refraction-ui/virtual-list'
