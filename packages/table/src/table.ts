/** Cell padding for every cell of a table. */
export type TableDensity = 'compact' | 'default'
/** Horizontal alignment of a header or data cell (logical, RTL-safe). */
export type TableAlign = 'start' | 'center' | 'end'
/** Look of header cells: `eyebrow` is small uppercase tracked text. */
export type TableHeadTone = 'default' | 'eyebrow'

export interface TableAPI {
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/** Framework-agnostic data attributes for the table root. */
export function createTable(
  props: { density?: TableDensity; headTone?: TableHeadTone } = {},
): TableAPI {
  return {
    dataAttributes: {
      'data-slot': 'table',
      'data-density': props.density ?? 'default',
      'data-head-tone': props.headTone ?? 'default',
    },
  }
}
