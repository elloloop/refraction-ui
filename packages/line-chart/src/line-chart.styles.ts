/** Token-class styles for LineChart; no colour literals. */
export const lineChartClasses = {
  root: 'relative',
  svg: 'block w-full rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  gridline: 'stroke-border',
  axis: 'fill-muted-foreground text-[9px]',
  crosshair: 'stroke-border',
  marker: 'stroke-card',
  tooltip:
    'pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-tertiary px-2.5 py-2 text-[11px] text-tertiary-foreground shadow-lg',
  tooltipLabel: 'mb-1 opacity-60',
  tooltipRow: 'flex justify-between gap-2',
  legend: 'mt-2.5 flex flex-wrap gap-3.5',
  legendItem: 'inline-flex items-center gap-1.5 text-[11px] text-muted-foreground',
  legendSwatch: 'h-[3px] w-2.5 rounded-sm',
} as const
