import { cva } from '@refraction-ui/shared'

/** The keyboard focus ring every focusable part of the calendar shares. */
const FOCUS_RING = [
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
].join(' ')

/** Root container. */
export const eventCalendarVariants = cva({
  base: 'flex flex-col overflow-hidden rounded-lg border border-border bg-background text-foreground',
  variants: {
    view: {
      day: '',
      week: '',
      month: '',
    },
  },
  defaultVariants: {
    view: 'week',
  },
})

/** Header bar: today / previous / next, the period title and the view switch. */
export const eventCalendarHeaderClass =
  'flex flex-wrap items-center gap-2 border-b border-border px-3 py-2'

/** Group holding the today / previous / next controls. */
export const eventCalendarNavClass = 'flex items-center gap-1'

/** Extra classes for the icon-only previous / next buttons: a ≥44 px hit area around a 36 px button. */
export const eventCalendarNavIconClass = 'relative after:absolute after:-inset-1'

/** Visible period title (also a polite live region so paging is announced). */
export const eventCalendarTitleClass = 'flex-1 truncate text-base font-semibold'

/** The time-grid (`role="grid"`) scroll container. */
export const eventCalendarTimeGridClass = 'relative max-h-[40rem] overflow-y-auto'

/** Sticky header rowgroup holding the day headers and the all-day row. */
export const eventCalendarTimeGridHeadClass =
  'sticky top-0 z-30 border-b border-border bg-background'

/** A flex row of the time grid. */
export const eventCalendarRowClass = 'flex'

/** The fixed-width gutter column holding hour labels. */
export const eventCalendarGutterClass =
  'w-16 shrink-0 pr-2 text-right text-xs tabular-nums text-muted-foreground'

/** A day column header in the time grid. */
export const eventCalendarColumnHeaderVariants = cva({
  base: 'flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-xs',
  variants: {
    today: {
      true: 'font-semibold text-foreground',
      false: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    today: 'false',
  },
})

/** The day-of-month figure. Today is filled *and* circled, so it is not colour alone. */
export const eventCalendarDayNumberVariants = cva({
  base: 'inline-flex h-7 shrink-0 items-center justify-center rounded-full text-sm tabular-nums',
  variants: {
    today: {
      true: 'bg-primary font-semibold text-primary-foreground',
      false: '',
    },
    /** `pill` fits month-boundary text such as "Nov 1". */
    shape: {
      circle: 'w-7',
      pill: 'px-2 font-medium',
    },
  },
  defaultVariants: {
    today: 'false',
    shape: 'circle',
  },
})

/** All-day cell (one per day) in the time-grid head. */
export const eventCalendarAllDayCellVariants = cva({
  base: ['relative min-w-0 flex-1 border-l border-border', 'cursor-pointer', FOCUS_RING].join(' '),
  variants: {
    preview: {
      true: 'bg-accent',
      false: '',
    },
  },
  defaultVariants: {
    preview: 'false',
  },
})

/** A slot cell of the time grid. */
export const eventCalendarSlotVariants = cva({
  base: [
    'relative min-w-0 flex-1 cursor-pointer border-l border-border',
    'hover:bg-muted/50',
    FOCUS_RING,
    'focus-visible:ring-inset focus-visible:ring-offset-0',
  ].join(' '),
  variants: {
    hour: {
      true: 'border-t border-t-border',
      false: 'border-t border-dashed border-t-border/50',
    },
  },
  defaultVariants: {
    hour: 'false',
  },
})

/** An event block / chip. `color` is a semantic token name; each fill uses its paired foreground. */
export const eventCalendarEventVariants = cva({
  base: [
    'flex min-w-0 overflow-hidden rounded-md text-left text-xs leading-tight',
    'border-l-4 border-l-foreground/40 ring-1 ring-background',
    'transition-colors motion-reduce:transition-none hover:brightness-95',
    FOCUS_RING,
  ].join(' '),
  variants: {
    color: {
      primary: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      tertiary: 'bg-tertiary text-tertiary-foreground',
      accent: 'bg-accent text-accent-foreground',
      success: 'bg-success text-success-foreground',
      warning: 'bg-warning text-warning-foreground',
      info: 'bg-info text-info-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
      muted: 'bg-muted text-foreground',
    },
    layout: {
      timed: 'absolute z-10 flex-col gap-0.5 px-1.5 py-0.5',
      bar: 'absolute z-10 h-6 items-center gap-1 px-1.5',
      chip: 'w-full items-center gap-1 px-1.5 py-0.5',
    },
  },
  defaultVariants: {
    color: 'primary',
    layout: 'timed',
  },
})

/** Event title text. */
export const eventCalendarEventTitleClass = 'truncate font-medium'

/** Event time / category text. */
export const eventCalendarEventMetaClass = 'truncate opacity-90'

/** The current-time line (decorative; today's header carries `aria-current`). */
export const eventCalendarNowLineClass =
  'pointer-events-none absolute inset-x-0 z-20 h-0.5 bg-destructive before:absolute before:-left-1 before:-top-1 before:size-2.5 before:rounded-full before:bg-destructive'

/** Drag / click create preview block. */
export const eventCalendarPreviewClass =
  'pointer-events-none absolute inset-x-0.5 z-20 rounded-md border-2 border-dashed border-primary bg-primary/10'

/** Month grid (`role="grid"`). */
export const eventCalendarMonthGridClass = 'flex flex-col'

/** Month weekday header row. */
export const eventCalendarMonthHeadClass = 'flex border-b border-border'

/** A month weekday column header. */
export const eventCalendarMonthColumnHeaderClass =
  'min-w-0 flex-1 py-2 text-center text-xs font-medium text-muted-foreground'

/** A month day cell. */
export const eventCalendarMonthCellVariants = cva({
  base: [
    'flex min-h-28 min-w-0 flex-1 cursor-pointer flex-col gap-0.5 border-l border-t border-border p-1',
    'first:border-l-0',
    FOCUS_RING,
    'focus-visible:ring-inset focus-visible:ring-offset-0',
  ].join(' '),
  variants: {
    outside: {
      true: 'bg-muted/40 text-muted-foreground',
      false: '',
    },
    preview: {
      true: 'bg-accent',
      false: '',
    },
  },
  defaultVariants: {
    outside: 'false',
    preview: 'false',
  },
})

/** "+N more" overflow control in a month cell. */
export const eventCalendarMoreClass = [
  'w-full rounded px-1.5 py-0.5 text-left text-xs font-medium text-muted-foreground',
  'hover:bg-accent hover:text-accent-foreground',
  FOCUS_RING,
].join(' ')

/** Visually hidden but announced. */
export const eventCalendarSrOnlyClass = 'sr-only'
