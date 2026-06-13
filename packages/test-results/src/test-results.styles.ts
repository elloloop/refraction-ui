import { cva } from '@refraction-ui/shared'

/** Outer container that wraps the summary bar and the test row list. */
export const testResultsContainerVariants = cva({
  base: 'flex flex-col gap-3 w-full',
  variants: {},
  defaultVariants: {},
})

/**
 * Summary bar ("2 / 3 passed").
 *
 * The `outcome` variant maps to a semantic color token so the bar turns green
 * when everything passes, red when there are failures.
 */
export const testResultsSummaryVariants = cva({
  base: [
    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
    'border',
  ].join(' '),
  variants: {
    outcome: {
      pass: 'border-success/30 bg-success/10 text-success',
      fail: 'border-destructive/30 bg-destructive/10 text-destructive',
      skip: 'border-muted/30 bg-muted/10 text-muted-foreground',
    },
  },
  defaultVariants: {
    outcome: 'pass',
  },
})

/** A single test row in the list. */
export const testRowVariants = cva({
  base: [
    'flex flex-col gap-1.5 rounded-md border px-3 py-2.5 text-sm',
  ].join(' '),
  variants: {
    status: {
      pass: 'border-success/20 bg-success/5',
      fail: 'border-destructive/20 bg-destructive/5',
      skip: 'border-muted/20 bg-muted/5',
    },
  },
  defaultVariants: {
    status: 'pass',
  },
})

/** Status icon / badge inside a test row (the PASS / FAIL / SKIP pill). */
export const testStatusBadgeVariants = cva({
  base: 'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
  variants: {
    status: {
      pass: 'bg-success/20 text-success',
      fail: 'bg-destructive/20 text-destructive',
      skip: 'bg-muted text-muted-foreground',
    },
  },
  defaultVariants: {
    status: 'pass',
  },
})

/** Test name text inside a row. */
export const testNameClass = 'font-medium text-foreground'

/** Duration text ("12 ms") inside a row. */
export const testDurationClass = 'text-xs text-muted-foreground'

/**
 * Expected / actual diff block shown beneath a failing test row.
 *
 * The `side` variant sets the left-border accent color to distinguish the two
 * sides of the diff.
 */
export const testDiffBlockVariants = cva({
  base: [
    'rounded border-l-2 bg-muted/30 px-3 py-2 font-mono text-xs text-foreground',
  ].join(' '),
  variants: {
    side: {
      expected: 'border-l-success text-success',
      actual: 'border-l-destructive text-destructive',
    },
  },
  defaultVariants: {
    side: 'actual',
  },
})

/** Error / skip message text beneath a test row. */
export const testMessageClass = 'text-xs text-muted-foreground italic'
