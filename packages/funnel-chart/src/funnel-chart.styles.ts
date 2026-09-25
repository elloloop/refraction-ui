/** Token-class styles for FunnelChart; no colour literals. */
export const funnelChartClasses = {
  root: 'm-0 grid list-none p-0',
  bar: 'relative flex items-center gap-3 overflow-hidden rounded-lg border border-border bg-background px-3.5 py-3',
  fill: 'absolute inset-y-0 left-0 border-r-2 border-primary bg-accent',
  chevron: 'relative shrink-0 text-primary',
  text: 'relative grid min-w-0 flex-1',
  label: 'text-[13px] font-bold text-foreground',
  description: 'text-[11px] text-muted-foreground',
  figure: 'relative grid text-right',
  value: 'text-[15px] font-bold tabular-nums text-foreground',
  share: 'text-[10.5px] text-muted-foreground',
  transition: 'flex items-center gap-2 py-1.5 pl-[18px] text-[11px] text-muted-foreground',
  conversion: 'font-semibold text-success',
  dropped: 'font-semibold text-destructive',
} as const
