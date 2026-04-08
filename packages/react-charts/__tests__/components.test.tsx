import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  Chart,
  Bars,
  Line,
  Circles,
  XAxis,
  YAxis,
  Gradient,
  Histogram,
  ScatterPlot,
  PieChart,
} from '../src/index.js'

describe('Chart', () => {
  it('renders an SVG element', () => {
    const html = renderToString(React.createElement(Chart, { width: 500, height: 300 }))
    expect(html).toContain('<svg')
    expect(html).toContain('width="500"')
    expect(html).toContain('height="300"')
  })

  it('renders children inside a translated group', () => {
    const child = React.createElement('rect', { width: 10, height: 10 })
    const html = renderToString(React.createElement(Chart, { width: 500, height: 300 }, child))
    expect(html).toContain('<g')
    expect(html).toContain('transform="translate(')
    expect(html).toContain('<rect')
  })

  it('applies custom margins', () => {
    const html = renderToString(
      React.createElement(Chart, {
        width: 500,
        height: 300,
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
      }),
    )
    expect(html).toContain('translate(10,10)')
  })
})

describe('Bars', () => {
  const data = [
    { label: 'A', value: 10 },
    { label: 'B', value: 20 },
    { label: 'C', value: 30 },
  ]

  it('renders rect elements for each data point', () => {
    const html = renderToString(
      React.createElement(Chart, { width: 500, height: 300 },
        React.createElement(Bars, {
          data,
          x: (d: typeof data[0]) => d.label,
          y: (d: typeof data[0]) => d.value,
        }),
      ),
    )
    const rectCount = (html.match(/<rect/g) || []).length
    expect(rectCount).toBe(3)
  })

  it('applies fill color', () => {
    const html = renderToString(
      React.createElement(Chart, { width: 500, height: 300 },
        React.createElement(Bars, {
          data,
          x: (d: typeof data[0]) => d.label,
          y: (d: typeof data[0]) => d.value,
          fill: 'steelblue',
        }),
      ),
    )
    expect(html).toContain('steelblue')
  })
})

describe('Line', () => {
  const data = [
    { x: 0, y: 10 },
    { x: 1, y: 20 },
    { x: 2, y: 15 },
  ]

  it('renders a path element', () => {
    const html = renderToString(
      React.createElement(Chart, { width: 500, height: 300 },
        React.createElement(Line, {
          data,
          x: (d: typeof data[0]) => d.x,
          y: (d: typeof data[0]) => d.y,
        }),
      ),
    )
    expect(html).toContain('<path')
    expect(html).toContain('d="M')
  })

  it('applies stroke color', () => {
    const html = renderToString(
      React.createElement(Chart, { width: 500, height: 300 },
        React.createElement(Line, {
          data,
          x: (d: typeof data[0]) => d.x,
          y: (d: typeof data[0]) => d.y,
          stroke: 'red',
        }),
      ),
    )
    expect(html).toContain('red')
  })
})

describe('Circles', () => {
  const data = [
    { x: 10, y: 20 },
    { x: 30, y: 40 },
  ]

  it('renders circle elements', () => {
    const html = renderToString(
      React.createElement(Chart, { width: 500, height: 300 },
        React.createElement(Circles, {
          data,
          cx: (d: typeof data[0]) => d.x,
          cy: (d: typeof data[0]) => d.y,
        }),
      ),
    )
    const circleCount = (html.match(/<circle/g) || []).length
    expect(circleCount).toBe(2)
  })

  it('applies radius', () => {
    const html = renderToString(
      React.createElement(Chart, { width: 500, height: 300 },
        React.createElement(Circles, {
          data,
          cx: (d: typeof data[0]) => d.x,
          cy: (d: typeof data[0]) => d.y,
          r: 8,
        }),
      ),
    )
    expect(html).toContain('r="8"')
  })
})

describe('XAxis', () => {
  it('renders tick marks', () => {
    const html = renderToString(
      React.createElement(Chart, { width: 500, height: 300 },
        React.createElement(XAxis, {
          ticks: [0, 25, 50, 75, 100],
          scale: (v: number) => v * 4,
          height: 260,
        }),
      ),
    )
    expect(html).toContain('<text')
    expect(html).toContain('<line')
  })
})

describe('YAxis', () => {
  it('renders tick marks', () => {
    const html = renderToString(
      React.createElement(Chart, { width: 500, height: 300 },
        React.createElement(YAxis, {
          ticks: [0, 50, 100],
          scale: (v: number) => 260 - v * 2.6,
        }),
      ),
    )
    expect(html).toContain('<text')
    expect(html).toContain('<line')
  })
})

describe('Gradient', () => {
  it('renders a linearGradient element', () => {
    const html = renderToString(
      React.createElement(Chart, { width: 500, height: 300 },
        React.createElement(Gradient, {
          id: 'myGradient',
          from: '#ff0000',
          to: '#0000ff',
        }),
      ),
    )
    expect(html).toContain('linearGradient')
    expect(html).toContain('myGradient')
    expect(html).toContain('#ff0000')
    expect(html).toContain('#0000ff')
  })
})

describe('Histogram', () => {
  it('renders a complete histogram with axes', () => {
    const data = [1, 2, 2, 3, 3, 3, 4, 4, 5, 6, 7, 8, 9, 10]
    const html = renderToString(
      React.createElement(Histogram, { data, width: 500, height: 300, bins: 5 }),
    )
    expect(html).toContain('<svg')
    expect(html).toContain('<rect')
    expect(html).toContain('<text')
  })
})

describe('ScatterPlot', () => {
  it('renders circles for data points', () => {
    const data = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 6 },
    ]
    const html = renderToString(
      React.createElement(ScatterPlot, {
        data,
        x: (d: typeof data[0]) => d.x,
        y: (d: typeof data[0]) => d.y,
        width: 500,
        height: 300,
      }),
    )
    expect(html).toContain('<svg')
    expect(html).toContain('<circle')
  })
})

describe('PieChart', () => {
  it('renders arc paths for data slices', () => {
    const data = [
      { label: 'A', value: 30 },
      { label: 'B', value: 70 },
    ]
    const html = renderToString(
      React.createElement(PieChart, {
        data,
        value: (d: typeof data[0]) => d.value,
        width: 300,
        height: 300,
      }),
    )
    expect(html).toContain('<svg')
    expect(html).toContain('<path')
  })

  it('renders one path per data slice', () => {
    const data = [
      { label: 'A', value: 10 },
      { label: 'B', value: 20 },
      { label: 'C', value: 30 },
    ]
    const html = renderToString(
      React.createElement(PieChart, {
        data,
        value: (d: typeof data[0]) => d.value,
        width: 300,
        height: 300,
      }),
    )
    const pathCount = (html.match(/<path/g) || []).length
    expect(pathCount).toBe(3)
  })
})
