---
id: PKG-CHARTS
track: packages
depends_on: ["PKG-REACT"]
size: M
labels: [feat]
status: pending
---

## Summary

Create `@refraction-ui/charts` package — a composable, context-based D3 chart system extracted from tinykite/next-d3. Provides SVG primitives (Bars, Circles, Line, Axes) that compose into higher-level charts (Histogram, ScatterPlot, Timeline).

## Source References

- **tinykite/next-d3** `src/components/Chart/Chart.tsx` — SVG container with React Context for dimensions
- **tinykite/next-d3** `src/components/Chart/Bars.tsx` — `<rect>` renderer with accessor pattern
- **tinykite/next-d3** `src/components/Chart/Circles.tsx` — `<circle>` renderer
- **tinykite/next-d3** `src/components/Chart/Line.tsx` — `<path>` for line/area charts, `d3.curveMonotoneX`
- **tinykite/next-d3** `src/components/Chart/Gradient.tsx` — SVG `<linearGradient>`
- **tinykite/next-d3** `src/components/Chart/XAxis.tsx` — Horizontal axis with responsive ticks
- **tinykite/next-d3** `src/components/Chart/YAxis.tsx` — Vertical axis (note: has bug to fix)
- **tinykite/next-d3** `src/components/Histogram.tsx` — Composed histogram with `d3.histogram()`
- **tinykite/next-d3** `src/components/ScatterPlot.tsx` — Composed scatter with `d3.scaleLinear()`
- **tinykite/next-d3** `src/components/Timeline.tsx` — Composed timeline with `d3.scaleTime()`
- **tinykite/next-d3** `src/lib/chart.tsx` — `useChartDimensions`, `useUniqueId`, `combineChartDimensions`, `callAccessor`
- **tinykite/next-d3** `src/lib/math.tsx` — `randomAroundMean` (Box-Muller)
- **elloloop/learnloop** `components/tutoring/blocks/PieChartRenderer.tsx` — SVG pie chart
- **elloloop/learnloop** `components/tutoring/blocks/CoordinateGridRenderer.tsx` — SVG coordinate grid
- **elloloop/learnloop** `components/tutoring/blocks/NumberLineRenderer.tsx` — SVG number line

## Acceptance Criteria

- [ ] Chart container provides dimensions via React Context
- [ ] Primitives (Bars, Circles, Line, Gradient, XAxis, YAxis) compose freely
- [ ] Composite charts (Histogram, ScatterPlot, Timeline, PieChart) work out of the box
- [ ] `useChartDimensions` hook provides ResizeObserver-based responsive sizing
- [ ] Accessor pattern (`callAccessor`) for flexible data binding
- [ ] Fix YAxis bug from original (incorrect `if (dimensions) return`)
- [ ] TypeScript strict types for all data/accessor interfaces
- [ ] Theming via CSS custom properties (stroke, fill, text colors)
- [ ] Unit tests for all components and hooks
- [ ] Storybook stories with example data

## Package Structure

```
packages/charts/
  src/
    primitives/
      Chart.tsx         # SVG container + ChartContext
      Bars.tsx
      Circles.tsx
      Line.tsx
      Gradient.tsx
      XAxis.tsx
      YAxis.tsx
    composites/
      Histogram.tsx
      ScatterPlot.tsx
      Timeline.tsx
      PieChart.tsx
      CoordinateGrid.tsx
      NumberLine.tsx
    hooks/
      use-chart-dimensions.ts
      use-unique-id.ts
    utils/
      call-accessor.ts
      combine-dimensions.ts
      random.ts
    index.ts
```

## Dependencies

- `d3-scale`, `d3-shape`, `d3-array`, `d3-time`, `d3-time-format` (modular D3)
- `resize-observer-polyfill` (optional)
