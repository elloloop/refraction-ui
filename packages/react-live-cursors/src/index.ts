export {
  LiveCursors,
  Cursor,
  type LiveCursorsProps,
  type CursorProps,
  type CursorData,
} from './live-cursors.js'

// Re-export headless helpers so consumers don't reach into the private core.
export { CURSOR_COLORS, assignCursorColor } from '@refraction-ui/live-cursors'
